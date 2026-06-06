import Gallery from "@/components/Gallery";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-full bg-black text-white">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">tekpi</h1>
        <UploadForm />
        <Gallery />
      </main>
    </div>
  );
}
