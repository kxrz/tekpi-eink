import GalleryClient from "@/components/GalleryClient";
import { deleteImage, listCrops, listOriginals } from "@/lib/blob";
import { revalidatePath } from "next/cache";

async function deleteImageAction(formData: FormData): Promise<void> {
  "use server";

  const url = formData.get("url");
  if (typeof url !== "string") return;

  await deleteImage(url);
  revalidatePath("/");
}

function basename(pathname: string): string {
  const segments = pathname.split("/");
  return segments[segments.length - 1] ?? pathname;
}

function basenameWithoutExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? name : name.slice(0, dot);
}

export default async function Gallery() {
  const [{ blobs: originals }, { blobs: crops }] = await Promise.all([
    listOriginals(),
    listCrops(),
  ]);

  if (originals.length === 0) {
    return <p className="text-zinc-400">Aucune image pour le moment.</p>;
  }

  // Map crop URL by base name (without extension) for lookup
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
        };
      })}
      deleteAction={deleteImageAction}
    />
  );
}
