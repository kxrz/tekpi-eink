import GalleryClient from "@/components/GalleryClient";
import { listCrops, listDisplay, listOriginals } from "@/lib/blob";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

function basename(pathname: string): string {
  const segments = pathname.split("/");
  return segments[segments.length - 1] ?? pathname;
}

function basenameWithoutExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? name : name.slice(0, dot);
}

async function deleteImageAction(formData: FormData): Promise<void> {
  "use server";

  const originalUrl = formData.get("originalUrl");
  const fileBase = formData.get("fileBase");
  if (typeof originalUrl !== "string" || typeof fileBase !== "string") return;

  // Collect all 3 versions to delete
  const [{ blobs: crops }, { blobs: display }] = await Promise.all([
    listCrops(),
    listDisplay(),
  ]);

  const cropBlob = crops.find((b) => basenameWithoutExt(basename(b.pathname)) === fileBase);
  const displayBlob = display.find((b) => basenameWithoutExt(basename(b.pathname)) === fileBase);

  const urlsToDelete = [
    originalUrl,
    cropBlob?.url,
    displayBlob?.url,
  ].filter((u): u is string => typeof u === "string");

  await del(urlsToDelete);
  revalidatePath("/");
}

export default async function Gallery() {
  const [{ blobs: originals }, { blobs: crops }] = await Promise.all([
    listOriginals(),
    listCrops(),
  ]);

  if (originals.length === 0) {
    return <p className="text-zinc-400">Aucune image pour le moment.</p>;
  }

  const cropByBase = new Map<string, string>();
  for (const crop of crops) {
    cropByBase.set(basenameWithoutExt(basename(crop.pathname)), crop.url);
  }

  return (
    <GalleryClient
      blobs={originals.map((blob) => {
        const base = basenameWithoutExt(basename(blob.pathname));
        return {
          url: blob.url,
          pathname: blob.pathname,
          originalUrl: blob.url,
          cropUrl: cropByBase.get(base) ?? null,
          fileBase: base,
        };
      })}
      deleteAction={deleteImageAction}
    />
  );
}
