import { listImages } from "@/lib/blob";
import { ditherToACeP } from "@/lib/dither";
import { NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(): Promise<Response> {
  const { blobs } = await listImages();

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

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const { data, info } = await sharp(imageBuffer)
    .rotate()
    .resize({ width: 800, height: 480, fit: "cover" })
    .modulate({ brightness: 1.1, saturation: 2.0 })
    .blur(0.4)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pngBuffer = await ditherToACeP(data, info.width, info.height);

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
