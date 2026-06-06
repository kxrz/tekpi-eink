"use client";

import ImageEditor from "@/components/ImageEditor";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

export default function UploadForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  async function handleConfirm(blob: Blob) {
    if (!selectedFile) {
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append(
      "file",
      new File([blob], selectedFile.name, { type: "image/jpeg" }),
    );

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Échec de l'envoi.");
      }

      setSelectedFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setSelectedFile(null);
    setError(null);
  }

  if (uploading) {
    return <p className="text-sm text-zinc-400">Envoi en cours...</p>;
  }

  if (selectedFile) {
    return (
      <div className="flex flex-col gap-4">
        <ImageEditor
          file={selectedFile}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-zinc-700"
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
