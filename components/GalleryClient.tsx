"use client";

import ImageEditor from "@/components/ImageEditor";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BlobItem = { url: string; pathname: string; originalUrl: string; cropUrl: string | null; fileBase: string };

type Props = {
  blobs: BlobItem[];
  deleteAction: (formData: FormData) => Promise<void>;
};

export default function GalleryClient({ blobs, deleteAction }: Props) {
  const router = useRouter();
  const [selectedBlob, setSelectedBlob] = useState<BlobItem | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpenEditor(blob: BlobItem) {
    setSelectedBlob(blob);
    setEditFile(null);
    setError(null);

    const response = await fetch(blob.originalUrl ?? blob.url);
    if (!response.ok) {
      setError("Impossible de charger l'image.");
      return;
    }

    const imageBlob = await response.blob();
    setEditFile(
      new File([imageBlob], blob.pathname, { type: imageBlob.type }),
    );
  }

  async function handleConfirm(croppedBlob: Blob) {
    if (!selectedBlob) {
      return;
    }

    setReplacing(true);
    setError(null);

    const formData = new FormData();
    formData.append(
      "file",
      new File(
        [croppedBlob],
        selectedBlob.pathname.replace("crops/", ""),
        { type: "image/jpeg" },
      ),
    );

    try {
      const response = await fetch("/api/store-display", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Échec de l'enregistrement.");
      }

      setSelectedBlob(null);
      setEditFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setReplacing(false);
    }
  }

  function handleCancel() {
    setSelectedBlob(null);
    setEditFile(null);
    setError(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {blobs.map((blob) => (
          <div key={blob.url} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditor(blob)}
              className="relative aspect-[5/3] cursor-pointer overflow-hidden rounded-lg border border-zinc-800 group"
            >
              <Image
                src={blob.cropUrl ?? blob.url}
                alt={blob.pathname}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {!blob.cropUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                    À cadrer
                  </span>
                </div>
              )}
            </button>
            <form action={deleteAction}>
              <input type="hidden" name="originalUrl" value={blob.originalUrl} />
              <input type="hidden" name="fileBase" value={blob.fileBase} />
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

      {selectedBlob !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto">
            {replacing ? (
              <p className="text-center text-sm text-zinc-400">
                Envoi en cours...
              </p>
            ) : editFile ? (
              <ImageEditor
                file={editFile}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ) : (
              <p className="text-center text-sm text-zinc-400">
                Chargement...
              </p>
            )}
            {error ? (
              <p className="mt-4 text-center text-sm text-red-400">{error}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
