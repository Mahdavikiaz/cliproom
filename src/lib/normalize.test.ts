import { describe, expect, it } from 'vitest';
import { AppError } from './errors';
import { normalizeResponse } from './normalize';

const ORIGINAL = 'https://example.com/post/1';

// Fixture sintetis (bukan respons nyata) yang meniru bentuk yang dijelaskan di brief.
const sample = () => ({
  url: ORIGINAL,
  source: 'tiktok',
  id: '123',
  unique_id: 'creator',
  author: 'Creator',
  title: 'Judul <b>uji</b>',
  thumbnail: 'https://cdn.example.com/t.jpg',
  duration: 15256,
  error: false,
  medias: [
    { url: 'https://cdn.example.com/v-hd.mp4', data_size: 1000, width: 720, height: 1280, quality: 'hd_no_watermark', extension: 'mp4', type: 'video' },
    { url: 'https://cdn.example.com/a.mp3', quality: 'audio', extension: 'mp3', type: 'audio', duration: 15 },
  ],
});

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof AppError ? e.code : 'other';
  }
  return 'none';
};

describe('normalizeResponse', () => {
  it('memetakan field dan menjaga satuan durasi', () => {
    const r = normalizeResponse(sample(), ORIGINAL);
    expect(r.source).toBe('tiktok');
    expect(r.uniqueId).toBe('creator');
    expect(r.durationMs).toBe(15256); // milidetik, tidak diubah
    expect(r.media).toHaveLength(2);
    expect(r.media[0]).toMatchObject({ type: 'video', dataSize: 1000, quality: 'hd_no_watermark' });
    expect(r.media[1].durationSeconds).toBe(15); // detik, tidak dikonversi lagi
  });

  it('teks metadata dikembalikan apa adanya (di-escape React saat render)', () => {
    expect(normalizeResponse(sample(), ORIGINAL).title).toBe('Judul <b>uji</b>');
  });

  it('field opsional hilang → undefined, bukan NaN', () => {
    const raw = { medias: [{ url: 'https://cdn.example.com/x.mp4' }] };
    const r = normalizeResponse(raw, 'https://www.example.com/p');
    expect(r.title).toBeUndefined();
    expect(r.durationMs).toBeUndefined();
    expect(r.source).toBe('example.com');
    expect(r.originalUrl).toBe('https://www.example.com/p');
  });

  it('menyaring media dengan URL bukan http(s) dan menyimpulkan tipe dari ekstensi', () => {
    const raw = {
      medias: [
        { url: 'javascript:alert(1)', extension: 'mp4' },
        { url: 'https://cdn.example.com/x.mp3', extension: 'mp3' },
      ],
    };
    const r = normalizeResponse(raw, ORIGINAL);
    expect(r.media).toHaveLength(1);
    expect(r.media[0].type).toBe('audio');
  });

  it('thumbnail non-http dibuang', () => {
    const raw = { ...sample(), thumbnail: 'data:image/png;base64,AAAA' };
    expect(normalizeResponse(raw, ORIGINAL).thumbnail).toBeUndefined();
  });

  it('melempar error untuk respons tidak sesuai', () => {
    expect(codeOf(() => normalizeResponse(null, ORIGINAL))).toBe('bad_response');
    expect(codeOf(() => normalizeResponse({ foo: 1 }, ORIGINAL))).toBe('bad_response');
  });

  it('sukses tetapi tanpa media → no_media', () => {
    expect(codeOf(() => normalizeResponse({ medias: [] }, ORIGINAL))).toBe('no_media');
    expect(codeOf(() => normalizeResponse({ medias: [{ url: 'ftp://x/y' }] }, ORIGINAL))).toBe('no_media');
  });

  it('error dari provider dipetakan', () => {
    expect(codeOf(() => normalizeResponse({ error: true, medias: [] }, ORIGINAL))).toBe('unprocessable');
    expect(codeOf(() => normalizeResponse({ error: 'Quota exceeded' }, ORIGINAL))).toBe('upstream_auth');
    expect(codeOf(() => normalizeResponse({ error: 'Too many requests' }, ORIGINAL))).toBe('rate_limited');
    expect(codeOf(() => normalizeResponse({ error: 'Video not found' }, ORIGINAL))).toBe('unprocessable');
  });
});
