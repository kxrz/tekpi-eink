import { del, list, type ListBlobResult } from "@vercel/blob";

export async function listImages(): Promise<ListBlobResult> {
  return list();
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}
