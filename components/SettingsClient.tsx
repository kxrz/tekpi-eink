"use client";

import {
  type AppConfig,
  type RotationMode,
} from "@/lib/config";
import { useEffect, useState } from "react";

type Props = {
  config: AppConfig;
};

const INTERVAL_OPTIONS: AppConfig["intervalHours"][] = [1, 2, 4, 8, 24];

const ROTATION_OPTIONS: { value: RotationMode; label: string }[] = [
  { value: "sequential", label: "Séquentiel" },
  { value: "random", label: "Aléatoire" },
  { value: "fixed", label: "Image fixe" },
];

const MODE_OPTIONS = [
  { value: "gallery", label: "Galerie", enabled: true },
  { value: "spotify", label: "Spotify", enabled: false },
  { value: "weather", label: "Météo", enabled: false },
  { value: "calendar", label: "Calendrier", enabled: false },
] as const;

export default function SettingsClient({ config }: Props) {
  const [rotation, setRotation] = useState<RotationMode>(config.rotation);
  const [fixedImage, setFixedImage] = useState(config.fixedImage ?? "");
  const [intervalHours, setIntervalHours] = useState(config.intervalHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload: AppConfig = {
      mode: "gallery",
      rotation,
      fixedImage: rotation === "fixed" ? fixedImage || null : null,
      intervalHours,
    };

    try {
      const response = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Échec de l'enregistrement.");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/[0.07] bg-zinc-900 p-6">
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Mode d&apos;affichage
          </p>
          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map((option) =>
              option.enabled ? (
                <button
                  key={option.value}
                  type="button"
                  className="rounded-full border border-white/[0.13] bg-white/[0.06] px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors duration-150"
                >
                  {option.label}
                </button>
              ) : (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] px-3 py-1.5 text-sm text-zinc-600"
                >
                  {option.label}
                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                    Bientôt
                  </span>
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Ordre
          </p>
          <div className="flex flex-wrap gap-2">
            {ROTATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRotation(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
                  rotation === option.value
                    ? "border-white/[0.13] bg-white/[0.06] text-[var(--text-primary)]"
                    : "border-white/[0.07] text-zinc-500 hover:bg-white/[0.04]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {rotation === "fixed" ? (
            <input
              type="text"
              value={fixedImage}
              onChange={(event) => setFixedImage(event.target.value)}
              placeholder="Nom du fichier (ex: photo.png)"
              className="mt-3 w-full rounded-md border border-white/[0.07] bg-zinc-800 px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-zinc-600 transition-colors duration-150 focus:border-white/[0.13] focus:outline-none"
            />
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Intervalle
          </p>
          <div className="inline-flex rounded-md border border-white/[0.07] p-0.5">
            {INTERVAL_OPTIONS.map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setIntervalHours(hours)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                  intervalHours === hours
                    ? "bg-white/[0.06] text-[var(--text-primary)]"
                    : "text-zinc-500 hover:bg-white/[0.04]"
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors duration-150 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {saved ? (
            <span className="text-sm text-zinc-500 transition-opacity duration-150">
              Enregistré
            </span>
          ) : null}
          {error ? (
            <span className="text-sm text-red-400">{error}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
