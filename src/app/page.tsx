'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DownloadButton } from '@/components/DownloadButton';
import { DownloaderForm } from '@/components/DownloaderForm';
import { MediaOptionList } from '@/components/MediaOptionList';
import { MediaPreview } from '@/components/MediaPreview';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import {
  EmptyStatus,
  ErrorStatus,
  LoadingStatus,
} from '@/components/StatusMessage';
import { messageFor } from '@/lib/errors';
import type { ApiErrorCode, ResolveResponse, ResolvedMedia } from '@/lib/types';
import { validateUrl } from '@/lib/url';

const CLIENT_TIMEOUT_MS = 35_000;

type View =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ResolvedMedia }
  | { status: 'error'; code: ApiErrorCode; message: string };

export default function Home() {
  const [url, setUrl] = useState('');
  const [view, setView] = useState<View>({ status: 'idle' });
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const loading = view.status === 'loading';

  useEffect(() => {
    if (view.status === 'success') resultRef.current?.focus();
  }, [view.status]);

  async function submit() {
    if (inFlight.current) return;

    const check = validateUrl(url);
    if (!check.ok) {
      setFieldError(messageFor(check.code));
      setView({ status: 'idle' });
      inputRef.current?.focus();
      return;
    }

    inFlight.current = true;
    setFieldError(undefined);
    setNotice(false);
    setSelected(0);
    setView({ status: 'loading' });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: check.url }),
        signal: controller.signal,
      });
      let body: ResolveResponse | undefined;
      try {
        body = (await res.json()) as ResolveResponse;
      } catch {
        body = undefined;
      }
      if (body?.ok) {
        setView({ status: 'success', data: body.data });
      } else if (body && !body.ok) {
        setView({
          status: 'error',
          code: body.error.code,
          message: body.error.message,
        });
      } else {
        setView({
          status: 'error',
          code: 'bad_response',
          message: messageFor('bad_response'),
        });
      }
    } catch (e) {
      const code: ApiErrorCode =
        e instanceof DOMException && e.name === 'AbortError'
          ? 'timeout'
          : 'network';
      setView({ status: 'error', code, message: messageFor(code) });
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
    }
  }

  function reset() {
    setUrl('');
    setView({ status: 'idle' });
    setFieldError(undefined);
    setNotice(false);
    setSelected(0);
    inputRef.current?.focus();
  }

  const success = view.status === 'success' ? view.data : undefined;
  const retryable =
    view.status === 'error' &&
    [
      'timeout',
      'network',
      'rate_limited',
      'upstream_error',
      'bad_response',
    ].includes(view.code);
  const current = success?.media[selected];
  const firstVideo = success?.media.find((m) => m.type === 'video');

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section
          aria-labelledby="hero-title"
          className={success ? 'max-w-3xl' : 'max-w-4xl'}
        >
          <p className="label-caps mb-4">Social Media · Downloader</p>
          <h1
            id="hero-title"
            className={`font-display font-bold leading-[0.95] tracking-tight ${
              success
                ? 'text-4xl sm:text-5xl'
                : 'text-5xl sm:text-7xl lg:text-8xl'
            }`}
          >
            Bring the link.
            <br />
            <span className="bg-acid">Get the content.</span>
          </h1>
          {!success ? (
            <p className="mt-6 max-w-xl text-lg">
              Paste link konten public, cek preview-nya, lalu download media
              yang tersedia.
            </p>
          ) : null}
        </section>

        <section
          className="mt-8 max-w-3xl sm:mt-10"
          aria-label="Form pengambilan media"
        >
          <DownloaderForm
            value={url}
            onChange={setUrl}
            onSubmit={submit}
            loading={loading}
            error={fieldError}
            inputRef={inputRef}
          />
          <div className="mt-4" aria-live="polite">
            {loading ? <LoadingStatus /> : null}
            {view.status === 'error' ? (
              <ErrorStatus
                message={view.message}
                action={
                  retryable ? (
                    <button
                      type="button"
                      onClick={submit}
                      className="btn bg-white"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Coba
                      lagi
                    </button>
                  ) : undefined
                }
              />
            ) : null}
          </div>
        </section>

        {success ? (
          <div
            ref={resultRef}
            tabIndex={-1}
            aria-label="Hasil"
            className="mt-10 border-t-2 border-ink pt-8 outline-none"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
              <MediaPreview data={success} previewUrl={firstVideo?.url} />
              <div className="min-w-0">
                {success.media.length === 0 ? (
                  <EmptyStatus />
                ) : (
                  <>
                    <MediaOptionList
                      media={success.media}
                      selected={selected}
                      onSelect={setSelected}
                    />
                    {current ? (
                      <div className="mt-5">
                        <DownloadButton
                          item={current}
                          onClick={() => setNotice(true)}
                        />
                        <p
                          className="mt-3 text-sm text-ink/70"
                          aria-live="polite"
                        >
                          {notice
                            ? 'Membuka media untuk diunduh… Jika hanya terbuka di tab baru, tekan lama (mobile) atau klik kanan lalu “Simpan sebagai…”.'
                            : 'Link media bisa kedaluwarsa. Jika gagal dibuka, ambil ulang dari link sumber.'}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="btn mt-8 bg-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Coba link
                  lain
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
