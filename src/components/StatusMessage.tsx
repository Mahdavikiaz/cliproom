import { Loader2, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingStatus() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 border-2 border-ink bg-white px-4 py-3">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="font-medium">Sedang membaca tautan…</span>
    </div>
  );
}

export function ErrorStatus({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-wrap items-start gap-3 border-2 border-ink bg-white px-4 py-3 shadow-hard-sm">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-violet" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="label-caps mb-1">Gagal</p>
        <p>{message}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyStatus() {
  return (
    <div role="status" className="border-2 border-dashed border-ink px-4 py-3">
      Belum ada media untuk ditampilkan.
    </div>
  );
}
