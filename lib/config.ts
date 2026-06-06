import { get, put } from "@vercel/blob";

export type DisplayMode = "gallery";
export type RotationMode = "sequential" | "random" | "fixed";

export interface AppConfig {
  mode: DisplayMode;
  rotation: RotationMode;
  fixedImage: string | null;
  intervalHours: 1 | 2 | 4 | 8 | 24;
}

export const DEFAULT_CONFIG: AppConfig = {
  mode: "gallery",
  rotation: "sequential",
  fixedImage: null,
  intervalHours: 4,
};

const CONFIG_PATH = "config/settings.json";

const INTERVAL_HOURS: AppConfig["intervalHours"][] = [1, 2, 4, 8, 24];
const ROTATION_MODES: RotationMode[] = ["sequential", "random", "fixed"];

function mergeConfig(partial: unknown): AppConfig {
  if (!partial || typeof partial !== "object") {
    return DEFAULT_CONFIG;
  }

  const obj = partial as Partial<AppConfig>;

  return {
    mode: "gallery",
    rotation: ROTATION_MODES.includes(obj.rotation as RotationMode)
      ? (obj.rotation as RotationMode)
      : DEFAULT_CONFIG.rotation,
    fixedImage:
      obj.fixedImage === null || typeof obj.fixedImage === "string"
        ? (obj.fixedImage ?? DEFAULT_CONFIG.fixedImage)
        : DEFAULT_CONFIG.fixedImage,
    intervalHours: INTERVAL_HOURS.includes(
      obj.intervalHours as AppConfig["intervalHours"],
    )
      ? (obj.intervalHours as AppConfig["intervalHours"])
      : DEFAULT_CONFIG.intervalHours,
  };
}

export function isValidAppConfig(value: unknown): value is AppConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    obj.mode === "gallery" &&
    typeof obj.rotation === "string" &&
    ROTATION_MODES.includes(obj.rotation as RotationMode) &&
    (obj.fixedImage === null || typeof obj.fixedImage === "string") &&
    typeof obj.intervalHours === "number" &&
    INTERVAL_HOURS.includes(obj.intervalHours as AppConfig["intervalHours"])
  );
}

export async function getConfig(): Promise<AppConfig> {
  try {
    const result = await get(CONFIG_PATH, { access: "public" });

    if (!result) {
      return DEFAULT_CONFIG;
    }

    const text = await new Response(result.stream).text();
    const parsed: unknown = JSON.parse(text);
    return mergeConfig(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await put(CONFIG_PATH, JSON.stringify(config), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}
