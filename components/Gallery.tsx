import { deleteImage, listImages } from "@/lib/blob";
import { revalidatePath } from "next/cache";
import Image from "next/image";

async function deleteImageAction(formData: FormData): Promise<void> {
  "use server";

  const url = formData.get("url");
  if (typeof url !== "string") {
    return;
  }

  await deleteImage(url);
  revalidatePath("/");
}

export default async function Gallery() {
  const { blobs } = await listImages();

  if (blobs.length === 0) {
    return <p className="text-zinc-400">Aucune image pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {blobs.map((blob) => (
        <div key={blob.url} className="flex flex-col gap-2">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800">
            <Image
              src={blob.url}
              alt={blob.pathname}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <form action={deleteImageAction}>
            <input type="hidden" name="url" value={blob.url} />
            <button
              type="submit"
              className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-900"
            >
              Supprimer
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
