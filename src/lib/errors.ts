import type { ApiErrorCode } from './types';

export class AppError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
    this.name = 'AppError';
  }
}

const MESSAGES: Record<ApiErrorCode, string> = {
  empty_url: 'Tempel link yang valid dulu.',
  invalid_url: 'Tempel link yang valid dulu.',
  unsupported_scheme: 'Hanya link http:// atau https:// yang bisa diproses.',
  private_host: 'Alamat ini tidak bisa diproses. Gunakan link publik dari media sosial.',
  url_too_long: 'Link terlalu panjang. Coba salin ulang tautan aslinya.',
  bad_request: 'Permintaan tidak valid. Muat ulang halaman lalu coba lagi.',
  not_configured: 'Layanan belum dikonfigurasi. Hubungi admin.',
  upstream_auth: 'Kuota layanan habis atau konfigurasi API bermasalah. Hubungi admin.',
  rate_limited: 'Layanan sedang sibuk. Coba lagi sebentar.',
  timeout: 'Layanan terlalu lama merespons. Coba lagi.',
  network: 'Tidak bisa menjangkau layanan. Periksa koneksi lalu coba lagi.',
  bad_response: 'Layanan mengembalikan data yang tidak terduga. Coba lagi nanti.',
  no_media: 'Tidak ada media yang bisa diunduh dari link ini.',
  unprocessable: 'Link ini belum bisa diproses. Pastikan kontennya publik dan coba lagi.',
  upstream_error: 'Layanan sedang bermasalah. Coba lagi sebentar.',
};

const STATUS: Record<ApiErrorCode, number> = {
  empty_url: 400,
  invalid_url: 400,
  unsupported_scheme: 400,
  private_host: 400,
  url_too_long: 400,
  bad_request: 400,
  not_configured: 503,
  upstream_auth: 502,
  rate_limited: 429,
  timeout: 504,
  network: 502,
  bad_response: 502,
  no_media: 422,
  unprocessable: 422,
  upstream_error: 502,
};

export function messageFor(code: ApiErrorCode): string {
  return MESSAGES[code];
}

export function httpStatusFor(code: ApiErrorCode): number {
  return STATUS[code];
}

/** Memetakan status HTTP dari provider ke kode error internal. */
export function mapUpstreamStatus(status: number): ApiErrorCode {
  if (status === 401 || status === 402 || status === 403) return 'upstream_auth';
  if (status === 429) return 'rate_limited';
  if (status === 408 || status === 504) return 'timeout';
  if (status === 400 || status === 404 || status === 410 || status === 422) return 'unprocessable';
  return 'upstream_error';
}

/** Memetakan teks error dari body provider (error: "...") ke kode internal. */
export function mapUpstreamMessage(text: string): ApiErrorCode {
  const t = text.toLowerCase();
  if (/(quota|exceeded|subscribe|not subscribed|invalid api key|unauthor)/.test(t)) return 'upstream_auth';
  if (/(rate|too many)/.test(t)) return 'rate_limited';
  return 'unprocessable';
}
