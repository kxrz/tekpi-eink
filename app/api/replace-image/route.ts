import { del, list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

function pathnameFromUrl(url: string): string {
  const parsed = new URL(url);
  const segments = parsed.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "";
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const url = formData.get("url");
  const file = formData.get("file");

  if (typeof url !== "string" || url.length === 0) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const { blobs } = await list();
  const existingBlob = blobs.find((blob) => blob.url === url);
  const pathname = existingBlob?.pathname ?? pathnameFromUrl(url);

  if (!pathname) {
    return NextResponse.json({ error: "Pathname introuvable" }, { status: 400 });
  }

  await del(url);

  const newBlob = await put(pathname, file, { access: "public" });

  return NextResponse.json({ url: newBlob.url }, { status: 200 });
}
