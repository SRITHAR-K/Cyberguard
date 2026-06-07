// netlify/functions/_shared.cjs
// In-memory store (persists per function instance; resets on cold start — perfect for demo)
const crypto = require('crypto');

// ── In-memory DB ──────────────────────────────────────────────
const db = {
  users: [
    {
      id: 'admin-uuid-0001',
      username: 'admin',
      email: 'admin@cyberguard.io',
      pw_hash: crypto.createHash('sha256').update('cg2024::admin123').digest('hex'),
      verified: true,
      role: 'admin',
      created_at: new Date('2024-01-01').toISOString(),
      last_login: null,
      otp: null,
      otp_exp: null,
    }
  ],
  uploads: [],
  threats: [],
  summaries: [],
  audit: [],
};

// ── Auth helpers ──────────────────────────────────────────────
const hashPw  = pw  => crypto.createHash('sha256').update(`cg2024::${pw}`).digest('hex');
const makeOtp = ()  => Array.from({length:6}, () => Math.floor(Math.random()*10)).join('');
const makeId  = ()  => crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
const makeToken = () => `${Date.now()}-${crypto.randomBytes(20).toString('hex')}`;

// Simple JWT-like signed token (base64 payload + HMAC)
const JWT_SECRET = process.env.JWT_SECRET || 'cyberguard-demo-secret-2024';
const signToken = (userId) => {
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
};
const verifyToken = (token) => {
  if (!token) throw new Error('No token');
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (sig !== expected) throw new Error('Invalid token');
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  // 7-day expiry
  if (Date.now() - data.iat > 7 * 24 * 60 * 60 * 1000) throw new Error('Token expired');
  return data;
};

// ── CORS headers ──────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

const ok  = (body, status=200) => ({ statusCode: status, headers: corsHeaders, body: JSON.stringify(body) });
const err = (msg,  status=400) => ({ statusCode: status, headers: corsHeaders, body: JSON.stringify({ error: msg }) });
const preflight = () => ({ statusCode: 204, headers: corsHeaders, body: '' });

// ── Require auth middleware ───────────────────────────────────
const requireAuth = (event) => {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new Error('Unauthorised');
  const payload = verifyToken(token);
  const user = db.users.find(u => u.id === payload.sub && u.verified);
  if (!user) throw new Error('User not found');
  return user;
};

// ── Severity classifier ───────────────────────────────────────
const SEV_LEVELS = ['Critical','High','Medium','Low','Normal'];
const normSev = s => {
  const v = String(s||'').toLowerCase().trim();
  if (/crit/.test(v))            return 'Critical';
  if (/high/.test(v))            return 'High';
  if (/med/.test(v))             return 'Medium';
  if (/low/.test(v))             return 'Low';
  if (/norm|benign|^0$/.test(v)) return 'Normal';
  return 'Medium';
};
const classifyRow = row => {
  for (const col of ['Severity','severity','Label','label','Attack','attack'])
    if (row[col] !== undefined) return normSev(row[col]);
  const r = Math.random();
  if (r < .40) return 'Normal';
  if (r < .65) return 'Low';
  if (r < .85) return 'Medium';
  if (r < .95) return 'High';
  return 'Critical';
};
const summarise = rows => {
  const counts = { Critical:0, High:0, Medium:0, Low:0, Normal:0 };
  for (const r of rows) counts[r.severity] = (counts[r.severity]||0)+1;
  const total = rows.length;
  const threatCount = (counts.Critical||0) + (counts.High||0);
  const threatRate  = total > 0 ? Math.round((threatCount/total)*100) : 0;
  const statusLabel = counts.Critical > 0 ? 'CRITICAL THREAT'
    : counts.High > 0   ? 'HIGH RISK'
    : counts.Medium > 0 ? 'ELEVATED'
    : counts.Low > 0    ? 'LOW RISK' : 'ALL CLEAR';
  return { counts, total, threatRate, statusLabel };
};

// ── CSV parser (no external deps) ────────────────────────────
const parseCsv = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g,'').trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.replace(/^"|"$/g,'').trim());
    const row = {};
    headers.forEach((h,i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
};

module.exports = {
  db, hashPw, makeOtp, makeId, makeToken,
  signToken, verifyToken, requireAuth,
  classifyRow, summarise, parseCsv, SEV_LEVELS,
  ok, err, preflight, corsHeaders,
};
