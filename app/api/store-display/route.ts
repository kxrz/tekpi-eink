import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  try {
    const blob = await put(`display/${file.name}`, file, { access: "public", allowOverwrite: true });
    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("store-display error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
