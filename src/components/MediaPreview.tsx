'use client';

import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDurationMs } from '@/lib/format';
import type { ResolvedMedia } from '@/lib/types';
import { PlatformBadge } from './PlatformBadge';

export function MediaPreview({ data, previewUrl }: { data: ResolvedMedia; previewUrl?: string }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => setVideoFailed(false), [previewUrl]);

  const duration = formatDurationMs(data.durationMs);
  const alt = data.title ? `Thumbnail: ${data.title}` : 'Thumbnail konten';
  const showThumb = data.thumbnail && !thumbFailed;

  return (
    <div>
      <div className="aspect-[9/12] max-h-[70vh] w-full overflow-hidden border-2 border-ink bg-ink shadow-hard sm:aspect-video lg:aspect-[3/4]">
        {previewUrl && !videoFailed ? (
          <video
            key={previewUrl}
            controls
            playsInline
            preload="none"
            poster={showThumb ? data.thumbnail : undefined}
            onError={() => setVideoFailed(true)}
            className="h-full w-full bg-ink object-contain"
          >
            <source src={previewUrl} />
          </video>
        ) : showThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.thumbnail}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setThumbFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-paper p-4 text-center">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">Preview tidak tersedia.</p>
          </div>
        )}
      </div>
      {previewUrl && videoFailed ? (
        <p className="mt-2 text-sm text-ink/70">Preview video tidak bisa dimuat. Gunakan tombol download atau buka postingan asli.</p>
      ) : null}

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge source={data.source} />
          {duration ? <span className="label-caps border-2 border-ink px-2 py-1">{duration}</span> : null}
        </div>
        {data.title ? <h2 className="mt-3 break-words font-display text-xl font-bold leading-snug">{data.title}</h2> : null}
        {data.author ? <p className="mt-1 break-words text-ink/80">oleh {data.author}</p> : null}
        <a
          href={data.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="label-caps mt-3 inline-block underline underline-offset-4"
        >
          Buka postingan asli ↗
        </a>
      </div>
    </div>
  );
}
