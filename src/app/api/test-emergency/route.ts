import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  // Placeholder: hook this up to your emergency broadcast endpoint if needed.
  return NextResponse.json({ success: true });
}
