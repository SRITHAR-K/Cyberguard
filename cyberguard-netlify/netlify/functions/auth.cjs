// netlify/functions/auth.cjs
const {
  db, hashPw, makeOtp, makeId,
  signToken, requireAuth,
  ok, err, preflight,
} = require('./_shared.cjs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  // Extract sub-path: /api/auth/login → login
  const path = (event.path || '').replace(/.*\/auth\/?/, '').replace(/^\//, '').split('/')[0];
  const method = event.httpMethod;

  // ── POST /api/auth/register ───────────────────────────────
  if (path === 'register' && method === 'POST') {
    const { username, email, password } = JSON.parse(event.body || '{}');
    if (!username || !email || !password)
      return err('All fields required');
    if (password.length < 6)
      return err('Password must be at least 6 characters');

    const exists = db.users.find(u => u.email === email.toLowerCase());
    if (exists) return err('Email already registered', 409);

    const otp = makeOtp();
    const user = {
      id: makeId(), username: username.trim(),
      email: email.toLowerCase(),
      pw_hash: hashPw(password),
      verified: false, role: 'user',
      otp, otp_exp: Date.now() + 10 * 60 * 1000,
      created_at: new Date().toISOString(), last_login: null,
    };
    db.users.push(user);

    // Dev mode: return OTP in response so demo works without email
    return ok({
      message: `Verification code sent to ${email}.`,
      _dev_otp: otp,  // shown in demo — remove in production
    });
  }

  // ── POST /api/auth/verify-otp ─────────────────────────────
  if (path === 'verify-otp' && method === 'POST') {
    const { email, otp } = JSON.parse(event.body || '{}');
    const user = db.users.find(u => u.email === email?.toLowerCase());
    if (!user)         return err('User not found', 404);
    if (user.otp !== otp) return err('Invalid code');
    if (Date.now() > user.otp_exp) return err('Code expired');

    user.verified  = true;
    user.otp       = null;
    user.otp_exp   = null;
    user.last_login = new Date().toISOString();
    const token = signToken(user.id);
    return ok({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  }

  // ── POST /api/auth/login ──────────────────────────────────
  if (path === 'login' && method === 'POST') {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return err('Missing credentials');

    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user || user.pw_hash !== hashPw(password))
      return err('Invalid email or password', 401);
    if (!user.verified)
      return err('Email not verified', 403);

    user.last_login = new Date().toISOString();
    db.audit.push({ action:'login', email: user.email, ip: event.headers?.['x-forwarded-for'], ts: new Date().toISOString() });
    const token = signToken(user.id);
    return ok({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  }

  // ── GET /api/auth/me ──────────────────────────────────────
  if (path === 'me' && method === 'GET') {
    try {
      const user = requireAuth(event);
      return ok({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (e) {
      return err(e.message, 401);
    }
  }

  // ── POST /api/auth/logout ─────────────────────────────────
  if (path === 'logout' && method === 'POST') {
    try {
      const user = requireAuth(event);
      db.audit.push({ action:'logout', email: user.email, ts: new Date().toISOString() });
      return ok({ message: 'Logged out' });
    } catch { return ok({ message: 'Logged out' }); }
  }

  return err('Not found', 404);
};
