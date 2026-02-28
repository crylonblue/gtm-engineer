import { NextRequest, NextResponse } from "next/server";
import { listObjects } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const prefix = req.nextUrl.searchParams.get("prefix") ?? "";

  try {
    const keys = await listObjects(prefix);
    return NextResponse.json({ keys });
  } catch (err) {
    console.error("R2 listObjects failed:", err);
    return NextResponse.json({ keys: [], error: "Failed to list objects" }, { status: 500 });
  }
}
