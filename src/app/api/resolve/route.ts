import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, httpStatusFor, messageFor } from '@/lib/errors';
import { normalizeResponse } from '@/lib/normalize';
import { fetchUpstream } from '@/lib/rapidapi';
import { rateLimit } from '@/lib/rate-limit';
import type { ApiErrorCode, ResolveResponse } from '@/lib/types';
import { validateUrl } from '@/lib/url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({ url: z.string() });

function fail(code: ApiErrorCode) {
  const body: ResolveResponse = { ok: false, error: { code, message: messageFor(code) } };
  return NextResponse.json(body, { status: httpStatusFor(code), headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(ip)) return fail('rate_limited');

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return fail('bad_request');
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return fail('bad_request');

  const check = validateUrl(parsed.data.url);
  if (!check.ok) return fail(check.code);

  try {
    const raw = await fetchUpstream(check.url);
    const data = normalizeResponse(raw, check.url);
    const body: ResolveResponse = { ok: true, data };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    // Hanya kode error yang dicatat: tanpa key, header, atau query string media.
    const code: ApiErrorCode = e instanceof AppError ? e.code : 'upstream_error';
    console.error(`[resolve] gagal: ${code}`);
    return fail(code);
  }
}
