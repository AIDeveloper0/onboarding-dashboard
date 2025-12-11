import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

const timeFields = [
  "shacharit1",
  "shacharit2",
  "mincha1",
  "mincha2",
  "ariv1",
  "ariv2",
  "shabbat_arvit1",
  "shabbat_arvit2",
  "shabbat_shacharit1",
  "shabbat_shacharit2",
  "shabbat_mincha1",
  "shabbat_mincha2",
] as const;

const miscFields = [
  "rabbi_msg",
  "tempCelsius",
  "layout_name",
  "image_transition_delay",
  "qr_holiday",
  "emergency_1",
  "emergency_2",
  "emergency_3",
  "emergency_4",
  "emergency_5",
] as const;

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { admin_key: string } }) {
  const adminKey = params.admin_key;
  if (!adminKey) return NextResponse.json({ error: "Missing admin_key" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, any> = {};

  timeFields.forEach((key) => {
    if (key in body) updates[key] = body[key];
  });
  miscFields.forEach((key) => {
    if (key in body) updates[key] = body[key];
  });
  zmanimKeys.forEach((key) => {
    if (key in body) updates[key] = body[key] ? true : false;
  });

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const { error } = await supabaseServer.from("synagogues").update(updates).eq("admin_key", adminKey);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
