import { describe, expect, it } from 'vitest';
import { httpStatusFor, mapUpstreamStatus, messageFor } from './errors';
import { downloadLabel, optionDetail, optionLabel } from './labels';
import { rateLimit } from './rate-limit';

describe('mapUpstreamStatus', () => {
  it('memetakan status provider', () => {
    expect(mapUpstreamStatus(401)).toBe('upstream_auth');
    expect(mapUpstreamStatus(403)).toBe('upstream_auth');
    expect(mapUpstreamStatus(429)).toBe('rate_limited');
    expect(mapUpstreamStatus(404)).toBe('unprocessable');
    expect(mapUpstreamStatus(504)).toBe('timeout');
    expect(mapUpstreamStatus(500)).toBe('upstream_error');
  });
});

describe('pesan dan status', () => {
  it('semua pesan berbahasa manusia dan tidak membocorkan secret', () => {
    expect(messageFor('invalid_url')).toBe('Tempel link yang valid dulu.');
    expect(messageFor('upstream_auth')).not.toMatch(/key|token|header/i);
    expect(httpStatusFor('rate_limited')).toBe(429);
    expect(httpStatusFor('not_configured')).toBe(503);
    expect(httpStatusFor('timeout')).toBe(504);
  });
});

describe('labels', () => {
  it('label opsi dan tombol', () => {
    const v = { url: 'https://x/y', type: 'video', quality: 'hd_no_watermark', extension: 'mp4', width: 720, height: 1280, dataSize: 2048 };
    expect(optionLabel(v)).toBe('Video · HD · no watermark · MP4');
    expect(optionDetail(v)).toBe('720×1280 · 2.0 KB');
    expect(downloadLabel(v)).toBe('Download MP4 · HD · no watermark');
    const a = { url: 'https://x/z', type: 'audio', quality: 'audio', extension: 'mp3' };
    expect(optionLabel(a)).toBe('Audio · MP3');
    expect(downloadLabel(a)).toBe('Download MP3');
  });
  it('detail kosong → undefined', () => {
    expect(optionDetail({ url: 'https://x/y' })).toBeUndefined();
  });
});

describe('rateLimit', () => {
  it('membatasi setelah 20 request per menit', () => {
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) expect(rateLimit('ip-a', now)).toBe(true);
    expect(rateLimit('ip-a', now)).toBe(false);
    expect(rateLimit('ip-b', now)).toBe(true);
    expect(rateLimit('ip-a', now + 61_000)).toBe(true);
  });
});
