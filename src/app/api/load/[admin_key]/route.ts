import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const bucket =
  process.env.SUPABASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET ??
  "pictures";

const imageFields = ["logo", "pic1", "pic2", "pic3", "pic4", "pic5", "qr"] as const;
const zmanimKeys = [
  "alotHaShachar",
  "alot72",
  "beinHashmashos",
  "chatzot",
  "chatzosNight",
  "civilDawn",
  "civilDusk",
  "minchaGedola",
  "minchaGedolaMGA",
  "minchaKetana",
  "minchaKetanaMGA",
  "misheyakir",
  "misheyakirMachmir",
  "plagHaMincha",
  "sunrise",
  "sunset",
  "sofZmanTfillaGRA",
  "sofZmanTfillaMGA",
  "sofZmanShacharitGRA",
  "sofZmanShacharitMGA",
] as const;

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ admin_key: string }> }) {
  const { admin_key: adminKey } = await params;
  if (!adminKey) return NextResponse.json({ error: "Missing admin_key" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("synagogues")
    .select("*")
    .eq("admin_key", adminKey)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result: Record<string, any> = { ...data };

  imageFields.forEach((field) => {
    const storedPath = (data as any)[`${field}_path`];
    if (storedPath) {
      const {
        data: { publicUrl },
      } = supabaseServer.storage.from(bucket).getPublicUrl(storedPath);
      result[`${field}_path_full`] = publicUrl;
      result[`${field}_path_thumb`] = publicUrl;
    } else {
      result[`${field}_path_full`] = null;
      result[`${field}_path_thumb`] = null;
    }
  });

  // Ensure booleans for zmanim flags
  zmanimKeys.forEach((key) => {
    result[key] = Boolean(result[key]);
  });

  return NextResponse.json(result);
}
