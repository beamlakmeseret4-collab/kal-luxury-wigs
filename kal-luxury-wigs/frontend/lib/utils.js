import clsx from 'clsx';

/** Merge conditional class names (thin wrapper so components read cleanly). */
export function cn(...args) {
  return clsx(...args);
}

/** Formats a number as Ethiopian Birr, e.g. formatPrice(8500) -> "ETB 8,500". */
export function formatPrice(amount) {
  if (typeof amount !== 'number') return '';
  return `ETB ${amount.toLocaleString('en-US')}`;
}

/** Normalizes an Ethiopian phone number for display/validation, mirroring
 * the backend's rule: local (09...), bare 9-digit, or +251 already. */
export function normalizeEthiopianPhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/[\s\-()]/g, '');
  if (digits.startsWith('+251')) digits = digits.slice(4);
  else if (digits.startsWith('251')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.replace(/\D/g, '');
  if (!/^[79]\d{8}$/.test(digits)) return null;
  return `+251${digits}`;
}

export function isValidEthiopianPhone(raw) {
  return normalizeEthiopianPhone(raw) !== null;
}

/** Truncates a string to a max length with an ellipsis. */
export function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
