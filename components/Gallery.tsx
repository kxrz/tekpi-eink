import GalleryClient from "@/components/GalleryClient";
import { deleteImage, listOriginals } from "@/lib/blob";
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

export default async function Gallery() {
  const { blobs } = await listOriginals();

  if (blobs.length === 0) {
    return <p className="text-zinc-400">Aucune image pour le moment.</p>;
  }

  return (
    <GalleryClient
      blobs={blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
      }))}
      deleteAction={deleteImageAction}
    />
  );
}
