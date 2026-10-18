import type { ApiErrorCode } from './types';

export const MAX_URL_LENGTH = 2048;

export type UrlCheck = { ok: true; url: string } | { ok: false; code: ApiErrorCode };

function isPrivateIPv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function isPrivateIPv6(hostWithBrackets: string): boolean {
  const h = hostWithBrackets.replace(/^\[|\]$/g, '').toLowerCase();
  if (!h.includes(':')) return false;
  if (h === '::1' || h === '::') return true;
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // fc00::/7
  if (/^fe[89ab]/.test(h)) return true; // fe80::/10
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(h);
  if (mapped) return isPrivateIPv4(mapped[1]);
  // WHATWG URL menormalkan ::ffff:127.0.0.1 menjadi ::ffff:7f00:1
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(h);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPrivateIPv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return false;
}

function isInternalHostname(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.lan') || h.endsWith('.home.arpa')) return true;
  // hostname tanpa titik (mis. "intranet") bukan host publik
  if (!h.includes('.') && !h.includes(':')) return true;
  return false;
}

/** Validasi URL input. Dipakai di client (UX) dan diulang di server. */
export function validateUrl(input: unknown): UrlCheck {
  if (typeof input !== 'string') return { ok: false, code: 'invalid_url' };
  const raw = input.trim();
  if (!raw) return { ok: false, code: 'empty_url' };
  if (raw.length > MAX_URL_LENGTH) return { ok: false, code: 'url_too_long' };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, code: 'invalid_url' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, code: 'unsupported_scheme' };
  }
  if (parsed.username || parsed.password) return { ok: false, code: 'invalid_url' };

  const host = parsed.hostname;
  if (!host) return { ok: false, code: 'invalid_url' };
  if (isInternalHostname(host) || isPrivateIPv4(host) || isPrivateIPv6(host)) {
    return { ok: false, code: 'private_host' };
  }

  return { ok: true, url: parsed.toString() };
}
