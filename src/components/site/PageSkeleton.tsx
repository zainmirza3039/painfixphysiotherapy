export function PageSkeleton() {
  return (
    <main
      className="page-skeleton min-h-screen px-4 py-5 sm:px-8"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex h-14 items-center justify-between border-b border-border">
          <div className="page-skeleton__bar h-8 w-32 animate-pulse motion-reduce:animate-none" />
          <div className="hidden items-center gap-3 sm:flex">
            <div className="page-skeleton__bar h-3 w-16 animate-pulse motion-reduce:animate-none" />
            <div className="page-skeleton__bar h-3 w-20 animate-pulse motion-reduce:animate-none" />
            <div className="page-skeleton__bar h-3 w-16 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="page-skeleton__bar h-9 w-24 animate-pulse motion-reduce:animate-none" />
        </div>

        <section className="grid min-h-[60vh] items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div className="space-y-5">
            <div className="page-skeleton__bar h-4 w-28 animate-pulse motion-reduce:animate-none" />
            <div className="space-y-3">
              <div className="page-skeleton__line h-9 w-full max-w-xl animate-pulse motion-reduce:animate-none" />
              <div className="page-skeleton__line h-9 w-4/5 max-w-lg animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="page-skeleton__line h-4 w-full max-w-lg animate-pulse motion-reduce:animate-none" />
              <div className="page-skeleton__line h-4 w-11/12 max-w-lg animate-pulse motion-reduce:animate-none" />
              <div className="page-skeleton__line h-4 w-3/4 max-w-md animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="flex gap-3 pt-3">
              <div className="page-skeleton__panel h-11 w-36 animate-pulse motion-reduce:animate-none" />
              <div className="page-skeleton__panel h-11 w-32 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
          <div className="page-skeleton__panel aspect-[4/3] w-full animate-pulse motion-reduce:animate-none" />
        </section>

        <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="page-skeleton__panel h-36 animate-pulse motion-reduce:animate-none" />
          <div className="page-skeleton__panel h-36 animate-pulse motion-reduce:animate-none" />
          <div className="page-skeleton__panel h-36 animate-pulse motion-reduce:animate-none" />
        </section>
      </div>
    </main>
  );
}
