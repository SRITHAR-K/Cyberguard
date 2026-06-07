// netlify/functions/admin.cjs
const { db, requireAuth, ok, err, preflight } = require('./_shared.cjs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  let user;
  try { user = requireAuth(event); }
  catch (e) { return err(e.message, 401); }
  if (user.role !== 'admin') return err('Admin access required', 403);

  const path   = (event.path || '').replace(/.*\/admin\/?/, '').replace(/^\//, '');
  const method = event.httpMethod;

  // ── GET /api/admin/stats ──────────────────────────────────
  if (path === 'stats' && method === 'GET') {
    const sev = {};
    for (const t of db.threats) sev[t.severity] = (sev[t.severity]||0)+1;
    return ok({
      totalUsers:   db.users.length,
      totalUploads: db.uploads.filter(u => u.status === 'done').length,
      threatBreakdown: Object.entries(sev).map(([severity, cnt]) => ({ severity, cnt: String(cnt) })),
    });
  }

  // ── GET /api/admin/users ──────────────────────────────────
  if (path === 'users' && method === 'GET') {
    const users = db.users.map(u => ({
      id: u.id, username: u.username, email: u.email,
      verified: u.verified, role: u.role,
      created_at: u.created_at, last_login: u.last_login,
    }));
    return ok({ users });
  }

  // ── GET /api/admin/audit ──────────────────────────────────
  if (path === 'audit' && method === 'GET') {
    const logs = db.audit
      .slice(-200)
      .reverse()
      .map((l, i) => ({ id: String(i), ...l, created_at: l.ts, ip_addr: l.ip || null }));
    return ok({ logs });
  }

  return err('Not found', 404);
};
