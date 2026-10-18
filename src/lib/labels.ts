import { formatBytes } from './format';
import type { MediaItem } from './types';

const QUALITY_LABELS: Record<string, string> = {
  hd_no_watermark: 'HD · no watermark',
  no_watermark: 'No watermark',
  watermark: 'Watermark',
  hd: 'HD',
  sd: 'SD',
  audio: 'Audio',
};

const TYPE_LABELS: Record<string, string> = { video: 'Video', audio: 'Audio', image: 'Gambar' };

export function qualityLabel(quality?: string): string | undefined {
  if (!quality) return undefined;
  const key = quality.toLowerCase();
  return QUALITY_LABELS[key] ?? quality.replace(/_/g, ' ');
}

/** Contoh: "Video · HD · MP4". Hanya memakai data yang tersedia. */
export function optionLabel(item: MediaItem): string {
  const parts: string[] = [];
  const type = item.type ? (TYPE_LABELS[item.type] ?? item.type) : undefined;
  if (type) parts.push(type);
  const q = qualityLabel(item.quality);
  // Hindari "Audio · Audio"
  if (q && q.toLowerCase() !== type?.toLowerCase()) parts.push(q);
  if (item.extension) parts.push(item.extension.toUpperCase());
  return parts.length ? parts.join(' · ') : 'Media';
}

/** Detail tambahan: resolusi dan ukuran, bila tersedia. */
export function optionDetail(item: MediaItem): string | undefined {
  const parts: string[] = [];
  if (item.width && item.height) parts.push(`${item.width}×${item.height}`);
  const size = formatBytes(item.dataSize);
  if (size) parts.push(size);
  return parts.length ? parts.join(' · ') : undefined;
}

/** Label tombol, contoh: "Download MP4 · HD". */
export function downloadLabel(item: MediaItem): string {
  const ext = item.extension ? item.extension.toUpperCase() : item.type === 'audio' ? 'Audio' : 'Media';
  const q = qualityLabel(item.quality);
  const showQ = q && q.toLowerCase() !== 'audio' ? ` · ${q}` : '';
  return `Download ${ext}${showQ}`;
}
