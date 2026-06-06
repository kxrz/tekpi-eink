"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

function resizeForUpload(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(
        1,
        1800 / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Compression échouée"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Compression échouée"));
          }
        },
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Compression échouée"));
    };

    img.src = url;
  });
}

export default function UploadForm() {
  const router = useRouter();
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];

    if (!file) {
      setCompressedFile(null);
      setOriginalFileName(null);
      return;
    }

    setCompressing(true);

    try {
      const compressed = await resizeForUpload(file);
      setCompressedFile(compressed);
      setOriginalFileName(file.name);
    } catch (err) {
      setCompressedFile(null);
      setOriginalFileName(null);
      setError(err instanceof Error ? err.message : "Compression échouée");
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);

    if (!compressedFile || !originalFileName) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "file",
      new File([compressedFile], originalFileName, { type: "image/jpeg" }),
    );

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Échec de l'envoi.");
      }

      form.reset();
      setCompressedFile(null);
      setOriginalFileName(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  const isIdle = !compressing && !uploading;

  return (
    <form onSubmit={handleSubmit}>
      <label
        className={`
          flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
          px-6 py-10 text-center transition-colors cursor-pointer
          ${compressedFile
            ? "border-zinc-600 bg-zinc-900"
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
          }
        `}
      >
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="sr-only"
        />

        {compressing ? (
          <>
            <span className="text-2xl">⏳</span>
            <span className="text-sm text-zinc-400">Compression en cours…</span>
          </>
        ) : compressedFile ? (
          <>
            <span className="text-2xl">✓</span>
            <span className="text-sm text-zinc-300 font-medium truncate max-w-full">
              {originalFileName}
            </span>
            <span className="text-xs text-zinc-500">Cliquer pour changer</span>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <p className="text-sm text-zinc-300 font-medium">Choisir une image</p>
              <p className="text-xs text-zinc-500 mt-1">JPEG ou PNG</p>
            </div>
          </>
        )}
      </label>

      <button
        type="submit"
        disabled={!isIdle || !compressedFile}
        className="mt-3 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {uploading ? "Envoi en cours…" : "Envoyer"}
      </button>

      {error ? (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      ) : null}
    </form>
  );
}
