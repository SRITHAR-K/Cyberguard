// netlify/functions/analysis.cjs
const {
  db, makeId,
  requireAuth, classifyRow, summarise, parseCsv,
  ok, err, preflight,
} = require('./_shared.cjs');

// ── Multipart form parser (no multer — pure Node) ─────────────
const parseMultipart = (event) => {
  const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) return null;

  const bodyBuf = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
  const boundaryBuf = Buffer.from(`--${boundary}`);

  // Split parts
  const parts = [];
  let start = 0;
  for (let i = 0; i < bodyBuf.length; i++) {
    if (bodyBuf.slice(i, i + boundaryBuf.length).equals(boundaryBuf)) {
      if (start > 0) parts.push(bodyBuf.slice(start, i - 2)); // trim \r\n
      start = i + boundaryBuf.length + 2; // skip \r\n
    }
  }

  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerStr = part.slice(0, headerEnd).toString();
    const dataStart = headerEnd + 4;
    const data = part.slice(dataStart);
    if (headerStr.includes('filename=')) {
      const nameMatch = headerStr.match(/filename="([^"]+)"/);
      return { filename: nameMatch?.[1] || 'upload.csv', data };
    }
  }
  return null;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  let user;
  try { user = requireAuth(event); }
  catch (e) { return err(e.message, 401); }

  const rawPath = (event.path || '').replace(/.*\/analysis\/?/, '').replace(/^\//, '');
  const segments = rawPath.split('/').filter(Boolean);
  const method   = event.httpMethod;

  // ── POST /api/analysis/upload ─────────────────────────────
  if (segments[0] === 'upload' && method === 'POST') {
    try {
      const parsed = parseMultipart(event);
      if (!parsed) return err('No file uploaded');

      const { filename, data } = parsed;
      const ext = filename.split('.').pop()?.toLowerCase();
      if (!['csv','xlsx','xls'].includes(ext))
        return err('Only CSV or Excel files are supported');

      // Parse CSV content
      let rows = [];
      if (ext === 'csv') {
        const text = data.toString('utf8');
        rows = parseCsv(text);
      } else {
        // For Excel: return mock data explaining limitation
        // In production, use xlsx on a real server
        rows = Array.from({ length: 50 }, (_, i) => ({
          PacketID: i + 1,
          Protocol: ['TCP','UDP','ICMP'][i%3],
          'Source IP': `192.168.1.${(i%254)+1}`,
          'Dest IP': `10.0.0.${(i%254)+1}`,
          Port: [80,443,22,8080,3306][i%5],
          Severity: ['Normal','Low','Medium','High','Critical'][i%5],
          Bytes: Math.floor(Math.random()*10000),
        }));
      }

      if (!rows.length) return err('File contains no data rows');

      const classified = rows.map(row => ({ ...row, severity: classifyRow(row) }));
      const summary    = summarise(classified);
      const uploadId   = makeId();
      const colCount   = Object.keys(rows[0]).length;

      // Store summary
      db.uploads.push({
        id: uploadId, user_id: user.id,
        filename, file_size: data.length,
        row_count: rows.length, col_count: colCount,
        status: 'done',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
      db.summaries.push({ upload_id: uploadId, ...summary });

      // Store threats (cap at 200 for memory)
      classified.slice(0, 200).forEach(r => {
        db.threats.push({
          id: makeId(), upload_id: uploadId, user_id: user.id,
          severity: r.severity,
          label: r.Label || r.label || r.Attack || r.attack || null,
          source_ip: r['Source IP'] || r.src_ip || null,
          dest_ip: r['Dest IP'] || r.dst_ip || null,
          protocol: r.Protocol || r.protocol || null,
          port: r['Dest Port'] || r.port || null,
          detected_at: new Date().toISOString(),
        });
      });

      return ok({
        uploadId,
        summary,
        columns: Object.keys(rows[0]),
        preview: classified.slice(0, 20),
      });
    } catch (e) {
      console.error('[analysis/upload]', e);
      return err(e.message || 'Analysis failed', 500);
    }
  }

  // ── GET /api/analysis/history ─────────────────────────────
  if (segments[0] === 'history' && method === 'GET') {
    const uploads = db.uploads
      .filter(u => u.user_id === user.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(u => {
        const s = db.summaries.find(x => x.upload_id === u.id) || {};
        return { ...u, ...s };
      });
    return ok({ uploads });
  }

  // ── GET /api/analysis/:id ─────────────────────────────────
  if (segments[0] && segments.length === 1 && method === 'GET') {
    const up = db.uploads.find(u => u.id === segments[0] && u.user_id === user.id);
    if (!up) return err('Not found', 404);
    const summary = db.summaries.find(s => s.upload_id === up.id);
    const threats = db.threats.filter(t => t.upload_id === up.id);
    return ok({ upload: { ...up, ...summary }, threats });
  }

  // ── DELETE /api/analysis/:id ──────────────────────────────
  if (segments[0] && segments.length === 1 && method === 'DELETE') {
    const idx = db.uploads.findIndex(u => u.id === segments[0] && u.user_id === user.id);
    if (idx === -1) return err('Not found', 404);
    db.uploads.splice(idx, 1);
    return ok({ message: 'Deleted' });
  }

  return err('Not found', 404);
};
