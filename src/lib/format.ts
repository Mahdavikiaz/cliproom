/** Format durasi dalam detik menjadi mm:ss atau hh:mm:ss. */
export function formatDuration(totalSeconds: number | undefined | null): string | undefined {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds) || totalSeconds < 0) return undefined;
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

/** Durasi utama dari API berupa milidetik. */
export function formatDurationMs(ms: number | undefined | null): string | undefined {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return undefined;
  return formatDuration(ms / 1000);
}

/** Format ukuran file: B / KB / MB (1 KB = 1024 B). */
export function formatBytes(bytes: number | undefined | null): string | undefined {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return undefined;
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
