import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * generate a 6-character session code. excludes ambiguous chars
 * (0/O, 1/I/L) so kids typing on chromebooks have a fair chance.
 */
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0 O I 1 L
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}
