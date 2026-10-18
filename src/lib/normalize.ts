import { AppError, mapUpstreamMessage } from './errors';
import type { MediaItem, ResolvedMedia } from './types';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function str(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : undefined;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function httpUrl(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function inferType(raw: string | undefined, quality: string | undefined, ext: string | undefined): string | undefined {
  const t = raw?.toLowerCase();
  if (t) return t;
  if (quality?.toLowerCase().includes('audio')) return 'audio';
  if (ext && ['mp3', 'm4a', 'aac', 'wav', 'ogg'].includes(ext.toLowerCase())) return 'audio';
  if (ext && ['mp4', 'webm', 'mov', 'mkv'].includes(ext.toLowerCase())) return 'video';
  if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext.toLowerCase())) return 'image';
  return undefined;
}

function normalizeMediaItem(item: unknown): MediaItem | null {
  if (!isObj(item)) return null;
  const url = httpUrl(item.url);
  if (!url) return null;
  const quality = str(item.quality);
  const extension = str(item.extension)?.replace(/^\./, '').toLowerCase();
  return {
    url,
    type: inferType(str(item.type), quality, extension),
    quality,
    extension,
    width: num(item.width),
    height: num(item.height),
    dataSize: num(item.data_size ?? item.dataSize),
    // Durasi per-item sudah dalam detik: tidak dikonversi lagi.
    durationSeconds: num(item.duration),
  };
}

/**
 * Mengubah respons provider menjadi ResolvedMedia.
 * Melempar AppError bila respons tidak sesuai atau tidak ada media.
 */
export function normalizeResponse(raw: unknown, originalUrl: string): ResolvedMedia {
  if (!isObj(raw)) throw new AppError('bad_response');

  // Provider menandai kegagalan lewat `error`: true atau string pesan.
  const err = raw.error;
  if (err === true) throw new AppError('unprocessable');
  if (typeof err === 'string' && err.trim() !== '' && err.toLowerCase() !== 'false') {
    throw new AppError(mapUpstreamMessage(err));
  }

  if (!Array.isArray(raw.medias)) throw new AppError('bad_response');

  const media = raw.medias.map(normalizeMediaItem).filter((m): m is MediaItem => m !== null);
  if (media.length === 0) throw new AppError('no_media');

  let source = str(raw.source);
  if (!source) {
    try {
      source = new URL(originalUrl).hostname.replace(/^www\./, '');
    } catch {
      source = 'unknown';
    }
  }

  return {
    originalUrl: httpUrl(raw.url) ?? originalUrl,
    source,
    id: str(raw.id),
    uniqueId: str(raw.unique_id ?? raw.uniqueId),
    author: str(raw.author),
    title: str(raw.title),
    thumbnail: httpUrl(raw.thumbnail),
    // Durasi utama dari API berupa milidetik (mis. 15256).
    durationMs: num(raw.duration),
    media,
  };
}
