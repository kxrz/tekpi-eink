"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

interface ImageEditorProps {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({
  file,
  onConfirm,
  onCancel,
}: ImageEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [imageUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => {
    const img = imgRef.current;
    if (!img) {
      return;
    }

    const initCropper = () => {
      cropperRef.current?.destroy();
      cropperRef.current = new Cropper(img, {
        aspectRatio: 800 / 480,
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
      });
    };

    if (img.complete) {
      initCropper();
    } else {
      img.addEventListener("load", initCropper);
    }

    return () => {
      img.removeEventListener("load", initCropper);
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  function handleRotateLeft() {
    cropperRef.current?.rotate(-90);
  }

  function handleRotateRight() {
    cropperRef.current?.rotate(90);
  }

  function handleConfirm() {
    const cropper = cropperRef.current;
    if (!cropper) {
      return;
    }

    const canvas = cropper.getCroppedCanvas({ width: 800, height: 480 });
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onConfirm(blob);
        }
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Aperçu"
          className="block h-auto max-w-full"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRotateLeft}
          className="flex-1 rounded-md border border-white/[0.07] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-white/[0.04]"
        >
          ↺ -90°
        </button>
        <button
          type="button"
          onClick={handleRotateRight}
          className="flex-1 rounded-md border border-white/[0.07] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-white/[0.04]"
        >
          ↻ +90°
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors duration-150 hover:bg-zinc-200"
        >
          Valider
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-white/[0.07] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-white/[0.04]"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
