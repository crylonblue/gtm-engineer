import { NextRequest, NextResponse } from "next/server";
import { putText } from "@/lib/r2";

export async function POST(req: NextRequest) {
  let body: { key?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { key, content } = body;

  if (!key || typeof content !== "string") {
    return NextResponse.json(
      { error: "Missing key or content" },
      { status: 400 },
    );
  }

  try {
    const contentType = key.endsWith(".csv") ? "text/csv" : "text/plain";
    await putText(key, content, contentType);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("R2 put failed:", err);
    return NextResponse.json(
      { error: "Failed to write object" },
      { status: 500 },
    );
  }
}
