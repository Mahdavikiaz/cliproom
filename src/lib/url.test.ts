import { describe, expect, it } from 'vitest';
import { validateUrl } from './url';

describe('validateUrl', () => {
  it('menerima URL https publik', () => {
    const r = validateUrl('  https://www.tiktok.com/@a/video/1  ');
    expect(r.ok).toBe(true);
  });

  it('menolak kosong dan non-string', () => {
    expect(validateUrl('   ')).toEqual({ ok: false, code: 'empty_url' });
    expect(validateUrl(undefined)).toEqual({ ok: false, code: 'invalid_url' });
  });

  it('menolak teks yang bukan URL', () => {
    expect(validateUrl('bukan url')).toEqual({ ok: false, code: 'invalid_url' });
  });

  it('menolak skema selain http/https', () => {
    expect(validateUrl('ftp://example.com/a')).toEqual({ ok: false, code: 'unsupported_scheme' });
    expect(validateUrl('javascript:alert(1)')).toEqual({ ok: false, code: 'unsupported_scheme' });
    expect(validateUrl('file:///etc/passwd')).toEqual({ ok: false, code: 'unsupported_scheme' });
  });

  it.each([
    'http://localhost:3000/x',
    'http://127.0.0.1/x',
    'http://10.0.0.5/x',
    'http://192.168.1.1/x',
    'http://172.20.0.1/x',
    'http://169.254.169.254/latest',
    'http://[::1]/x',
    'http://[fd00::1]/x',
    'http://[fe80::1]/x',
    'http://[::ffff:127.0.0.1]/x',
    'http://intranet/x',
    'http://printer.local/x',
  ])('menolak host internal: %s', (u) => {
    expect(validateUrl(u)).toEqual({ ok: false, code: 'private_host' });
  });

  it('tidak menolak IP publik', () => {
    expect(validateUrl('http://172.32.0.1/x').ok).toBe(true);
  });

  it('menolak kredensial di URL dan URL terlalu panjang', () => {
    expect(validateUrl('https://user:pw@example.com/')).toEqual({ ok: false, code: 'invalid_url' });
    expect(validateUrl('https://example.com/' + 'a'.repeat(3000))).toEqual({ ok: false, code: 'url_too_long' });
  });
});
