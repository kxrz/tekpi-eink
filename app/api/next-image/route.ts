import { listDisplay } from "@/lib/blob";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  const { blobs } = await listDisplay();

  if (blobs.length === 0) {
    return NextResponse.json(
      { error: "No images available" },
      { status: 404 },
    );
  }

  const index =
    Math.floor(Date.now() / (4 * 60 * 60 * 1000)) % blobs.length;
  const selectedBlob = blobs[index];

  const imageResponse = await fetch(selectedBlob.url);

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch source image" },
      { status: 502 },
    );
  }

  const pngBuffer = Buffer.from(await imageResponse.arrayBuffer());

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
