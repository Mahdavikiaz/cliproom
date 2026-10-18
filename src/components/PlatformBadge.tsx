export function PlatformBadge({ source }: { source: string }) {
  return (
    <span className="label-caps inline-block border-2 border-ink bg-acid px-2 py-1" title="Sumber terdeteksi">
      {source}
    </span>
  );
}
