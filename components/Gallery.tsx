import GalleryClient from "@/components/GalleryClient";
import { deleteImage, listCrops, listOriginals } from "@/lib/blob";
import { revalidatePath } from "next/cache";

async function deleteImageAction(formData: FormData): Promise<void> {
  "use server";

  const url = formData.get("url");
  if (typeof url !== "string") {
    return;
  }

  await deleteImage(url);
  revalidatePath("/");
}

function basenameFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  return segments[segments.length - 1] ?? pathname;
}

export default async function Gallery() {
  const [{ blobs: crops }, { blobs: originals }] = await Promise.all([
    listCrops(),
    listOriginals(),
  ]);

  const originalUrlByBasename = new Map<string, string>();
  for (const blob of originals) {
    originalUrlByBasename.set(basenameFromPathname(blob.pathname), blob.url);
  }

  if (crops.length === 0) {
    return <p className="text-zinc-400">Aucune image pour le moment.</p>;
  }

  return (
    <GalleryClient
      blobs={crops.map((blob) => {
        const basename = basenameFromPathname(blob.pathname);
        return {
          url: blob.url,
          pathname: blob.pathname,
          originalUrl: originalUrlByBasename.get(basename) ?? blob.url,
        };
      })}
      deleteAction={deleteImageAction}
    />
  );
}
