export type MediaItem = {
  url: string;
  type?: 'video' | 'audio' | 'image' | string;
  quality?: string;
  extension?: string;
  width?: number;
  height?: number;
  dataSize?: number;
  durationSeconds?: number;
};

export type ResolvedMedia = {
  originalUrl: string;
  source: string;
  id?: string;
  uniqueId?: string;
  author?: string;
  title?: string;
  thumbnail?: string;
  /** Durasi utama, sudah dalam milidetik (sesuai respons API). */
  durationMs?: number;
  media: MediaItem[];
};

export type ApiErrorCode =
  | 'empty_url'
  | 'invalid_url'
  | 'unsupported_scheme'
  | 'private_host'
  | 'url_too_long'
  | 'bad_request'
  | 'not_configured'
  | 'upstream_auth'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'bad_response'
  | 'no_media'
  | 'unprocessable'
  | 'upstream_error';

export type ResolveSuccess = { ok: true; data: ResolvedMedia };
export type ResolveFailure = { ok: false; error: { code: ApiErrorCode; message: string } };
export type ResolveResponse = ResolveSuccess | ResolveFailure;
