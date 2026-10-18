import 'server-only';
import { AppError, mapUpstreamStatus } from './errors';

/**
 * Adapter RapidAPI (terisolasi). Hanya modul ini yang tahu soal host, endpoint,
 * method, dan header provider.
 *
 * TODO(konfirmasi): method + path (POST /v1/social/autolink) berasal dari sumber
 * pihak ketiga, bukan dokumentasi resmi RapidAPI. Verifikasi lalu sesuaikan
 * RAPIDAPI_ENDPOINT di .env.local bila berbeda.
 */

export const UPSTREAM_TIMEOUT_MS = 25_000;

type Config = { key: string; host: string; endpoint: string };

export function getConfig(): Config {
  const key = process.env.RAPIDAPI_KEY?.trim();
  const host = process.env.RAPIDAPI_HOST?.trim() || 'social-download-all-in-one.p.rapidapi.com';
  const endpoint = process.env.RAPIDAPI_ENDPOINT?.trim() || `https://${host}/v1/social/autolink`;
  if (!key || key.startsWith('isi_') || key.startsWith('ISI_')) throw new AppError('not_configured');
  try {
    const u = new URL(endpoint);
    if (u.protocol !== 'https:') throw new Error('https only');
  } catch {
    throw new AppError('not_configured');
  }
  return { key, host, endpoint };
}

export async function fetchUpstream(targetUrl: string): Promise<unknown> {
  const { key, host, endpoint } = getConfig();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': host,
        'X-RapidAPI-Key': key,
      },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'error',
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw new AppError('timeout');
    throw new AppError('network');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // Body error tidak diteruskan ke pengguna; cukup status untuk pemetaan.
    throw new AppError(mapUpstreamStatus(res.status));
  }

  try {
    return await res.json();
  } catch {
    throw new AppError('bad_response');
  }
}
