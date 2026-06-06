import { isValidAppConfig, saveConfig } from "@/lib/config";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json();

  if (!isValidAppConfig(body)) {
    return NextResponse.json({ error: "Configuration invalide" }, { status: 400 });
  }

  await saveConfig(body);

  return NextResponse.json({ ok: true }, { status: 200 });
}
