export function SiteHeader() {
  const home = process.env.NEXT_PUBLIC_DIGILOOT_URL;
  return (
    <header className="border-b-2 border-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="font-display text-lg font-bold tracking-tight sm:text-xl">
          CLIPROOM
        </p>
        <div className="flex items-center gap-3">
          <span className="label-caps hidden border-2 border-ink bg-acid px-2 py-1 sm:inline-block">
            Creator tool
          </span>
          {home ? (
            <a
              href={home}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps underline underline-offset-4"
            >
              Digiloot ↗
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
