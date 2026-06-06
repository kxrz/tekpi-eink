import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Type MIME non autorisé. Seuls JPEG et PNG sont acceptés." },
      { status: 400 },
    );
  }

  const blob = await put(`originals/${file.name}`, file, { access: "public" });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
