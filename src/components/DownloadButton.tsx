import { Download } from 'lucide-react';
import { downloadLabel } from '@/lib/labels';
import type { MediaItem } from '@/lib/types';

export function DownloadButton({ item, onClick }: { item: MediaItem; onClick?: () => void }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      download
      onClick={onClick}
      className="btn w-full bg-ink text-paper shadow-hard"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {downloadLabel(item)}
    </a>
  );
}
