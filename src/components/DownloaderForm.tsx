'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import type { FormEvent, Ref } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
};

export function DownloaderForm({ value, onChange, onSubmit, loading, error, inputRef }: Props) {
  const handle = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handle} noValidate className="w-full">
      <label htmlFor="media-url" className="label-caps mb-2 block">
        Link konten
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="media-url"
          ref={inputRef}
          type="url"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tempel link TikTok, Instagram, YouTube, atau sumber lain…"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'url-error url-help' : 'url-help'}
          className="min-h-14 w-full min-w-0 flex-1 rounded border-2 border-ink bg-white px-4 text-base placeholder:text-ink/50"
        />
        <button type="submit" disabled={loading} className="btn min-h-14 bg-violet text-white shadow-hard sm:min-w-44">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Memproses
            </>
          ) : (
            <>
              Ambil media <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      {error ? (
        <p id="url-error" role="alert" className="mt-2 border-l-4 border-violet pl-3 font-medium">
          {error}
        </p>
      ) : null}
      <p id="url-help" className="mt-3 text-sm text-ink/80">
        Pastikan kamu punya izin untuk menyimpan dan menggunakan konten tersebut.
      </p>
    </form>
  );
}
