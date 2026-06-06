import Gallery from "@/components/Gallery";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-widest uppercase text-white">
              tekpi
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">e-ink display manager</p>
          </div>
          <span className="text-xs text-zinc-600 font-mono">800 × 480 · 7 colors</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-10">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
            Ajouter une image
          </h2>
          <UploadForm />
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
            Galerie
          </h2>
          <Gallery />
        </section>
      </main>
    </div>
  );
}
