import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  // Placeholder: integrate with your TV refresh mechanism if available.
  return NextResponse.json({ success: true });
}
