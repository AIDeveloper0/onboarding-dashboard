import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import crypto from "crypto";

const bucket =
  process.env.SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET ??
  "pictures";

const imageFields = ["logo", "pic1", "pic2", "pic3", "pic4", "pic5", "qr"] as const;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { admin_key: string } }) {
  const adminKey = params.admin_key;
  if (!adminKey) return NextResponse.json({ error: "Missing admin_key" }, { status: 400 });

  const formData = await request.formData();
  const entries = Array.from(formData.entries()).filter(([key, value]) => {
    return imageFields.includes(key as any) && value instanceof File;
  }) as [string, File][];

  if (entries.length === 0) {
    return NextResponse.json({ error: "No file found in request." }, { status: 400 });
  }

  // Fetch TV key for foldering
  const { data: tvRow, error: tvErr } = await supabaseServer
    .from("synagogues")
    .select("tv_key")
    .eq("admin_key", adminKey)
    .maybeSingle();
  if (tvErr) return NextResponse.json({ error: tvErr.message }, { status: 500 });
  if (!tvRow?.tv_key) return NextResponse.json({ error: "tv_key not found for admin_key" }, { status: 404 });

  const tvKey = tvRow.tv_key as string;
  const uploaded: Record<string, { name: string; tv_key: string }> = {};

  for (const [field, file] of entries) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filename = `${field}-${crypto.randomUUID()}.${ext}`;
    const storagePath = `${tvKey}/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseServer.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Update DB field path
    const { error: dbErr } = await supabaseServer
      .from("synagogues")
      .update({ [`${field}_path`]: storagePath })
      .eq("admin_key", adminKey);
    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    uploaded[field] = { name: filename, tv_key: tvKey };
  }

  return NextResponse.json({ success: true, uploaded });
}
