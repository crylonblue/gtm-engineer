import { NextRequest, NextResponse } from "next/server";
import { getJson, getText } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  try {
    if (key.endsWith(".json")) {
      const content = await getJson(key);
      return NextResponse.json({ key, content, format: "json" });
    }

    const content = await getText(key);
    return NextResponse.json({ key, content, format: "text" });
  } catch (err) {
    console.error("R2 get failed:", err);
    return NextResponse.json({ key, error: "Failed to fetch object" }, { status: 500 });
  }
}
