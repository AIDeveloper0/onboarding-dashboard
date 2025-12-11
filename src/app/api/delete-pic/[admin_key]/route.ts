import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const bucket =
  process.env.SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET ??
  "pictures";
const imageFields = ["logo", "pic1", "pic2", "pic3", "pic4", "pic5", "qr"] as const;

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ admin_key: string }> }) {
  const { admin_key: adminKey } = await params;
  if (!adminKey) return NextResponse.json({ error: "Missing admin_key" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const field = body?.field;
  if (!imageFields.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const col = `${field}_path`;
  const { data: row, error } = await supabaseServer
    .from("synagogues")
    .select(`tv_key, ${col}`)
    .eq("admin_key", adminKey)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const path = (row as any)[col] as string | null;
  if (path) {
    await supabaseServer.storage.from(bucket).remove([path]).catch(() => {});
  }
  const { error: updateErr } = await supabaseServer.from("synagogues").update({ [col]: null }).eq("admin_key", adminKey);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
