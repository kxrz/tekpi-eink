import { del, list, type ListBlobResult } from "@vercel/blob";

export async function listImages(): Promise<ListBlobResult> {
  return list();
}

export async function listOriginals(): Promise<ListBlobResult> {
  return list({ prefix: "originals/" });
}

export async function listDisplay(): Promise<ListBlobResult> {
  return list({ prefix: "display/" });
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
