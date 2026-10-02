// Centralized Admin Passcode & Session Token Authentication & Rate-Limiting Middleware (QA-027)
const crypto = require('crypto');

const failedAttempts = new Map(); // ip -> { count, resetTime }
const activeSessions = new Map(); // token -> { createdAt, expiresAt }

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 15;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour short-lived session

function createSession() {
  const token = 'msv_sess_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  });
  return token;
}

function revokeSession(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

function verifyAdminPasscode(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = failedAttempts.get(clientIp) || { count: 0, resetTime: now + WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_MS;
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Security rate limit exceeded. Too many failed admin authentication attempts. Please retry in ${remainingSeconds} seconds.`
    });
  }

  const authHeader = req.headers['x-admin-token'] || req.headers['x-admin-passcode'] || req.query.token || req.query.passcode;

  // 1. Verify active session token if present
  if (authHeader && activeSessions.has(authHeader)) {
    const session = activeSessions.get(authHeader);
    if (now < session.expiresAt) {
      req.adminSession = session;
      req.adminToken = authHeader;
      return next();
    } else {
      activeSessions.delete(authHeader);
    }
  }

  // 2. Verify strong admin passcode (default admin123 is rejected)
  const validPasscode = process.env.ADMIN_PASSCODE || 'MansalvicSecure2026!';

  if (authHeader && authHeader === validPasscode) {
    // Reset failed counter on successful authentication
    failedAttempts.delete(clientIp);
    const token = createSession();
    res.setHeader('X-Admin-Session-Token', token);
    req.adminToken = token;
    return next();
  }

  record.count++;
  failedAttempts.set(clientIp, record);
  res.status(401).json({
    success: false,
    error: 'Unauthorized: Invalid Admin Passcode or Expired Session'
  });
}

module.exports = {
  verifyAdminPasscode,
  createSession,
  revokeSession
};
