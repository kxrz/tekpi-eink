import Gallery from "@/components/Gallery";
import Settings from "@/components/Settings";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-full bg-[var(--surface)] text-[var(--text-primary)]">
      <header className="border-b border-white/[0.07] px-4 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-sm font-medium uppercase tracking-widest text-[var(--text-primary)]">
            tekpi
          </h1>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            800×480 · 7 colors
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10">
        <section>
          <h2 className="mb-5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Bibliothèque
          </h2>
          <div className="flex flex-col gap-8">
            <UploadForm />
            <Gallery />
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Configuration
          </h2>
          <Settings />
        </section>
      </main>

      <footer className="border-t border-white/[0.07] px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs text-[var(--text-muted)]">
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}
          </p>
        </div>
      </footer>
    </div>
  );
}
