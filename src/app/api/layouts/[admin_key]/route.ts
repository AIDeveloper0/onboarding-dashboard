import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  // If you have a "layouts" table with a "name" column, return it; otherwise return an empty list.
  try {
    const { data, error } = await supabaseServer.from("layouts").select("name");
    if (error) {
      // If table doesn't exist, just return empty.
      if (error.message?.toLowerCase().includes("does not exist")) {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json((data ?? []).map((row) => row.name));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load layouts" }, { status: 500 });
  }
}
