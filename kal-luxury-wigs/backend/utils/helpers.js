const jwt = require('jsonwebtoken');

/**
 * Wraps an async Express route handler so thrown errors / rejected
 * promises are forwarded to next(), instead of needing try/catch
 * in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Signs a JWT for a user id. `isAdmin` uses a shorter expiry so admin
 * sessions need to re-authenticate more often than customer sessions.
 */
const generateToken = (userId, isAdmin = false) => {
  const expiresIn = isAdmin
    ? process.env.ADMIN_JWT_EXPIRE || '2d'
    : process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Normalizes an Ethiopian phone number to E.164 (+2519XXXXXXXX / +2517XXXXXXXX).
 * Accepts local format (0911234567), bare 9-digit (911234567), or already
 *-formatted +251911234567. Returns null if it doesn't look like a valid
 * Ethiopian mobile number.
 */
const normalizeEthiopianPhone = (raw) => {
  if (!raw) return null;
  let digits = String(raw).replace(/[\s\-()]/g, '');

  if (digits.startsWith('+251')) digits = digits.slice(4);
  else if (digits.startsWith('251')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);

  digits = digits.replace(/\D/g, '');

  if (!/^[79]\d{8}$/.test(digits)) return null;
  return `+251${digits}`;
};

/** Generates a random alphanumeric string, e.g. for temp filenames. */
const randomString = (len = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

module.exports = { asyncHandler, generateToken, normalizeEthiopianPhone, randomString };
