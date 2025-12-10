import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { data: magic, error: magicError } = await supabaseServer
    .from("magic_links")
    .select("email, metadata, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (magicError || !magic) {
    return NextResponse.json(
      { error: "Invalid token." },
      { status: 401 },
    );
  }

  if (magic.expires_at && magic.expires_at < now) {
    return NextResponse.json(
      { error: "Token expired. Please request a new link." },
      { status: 401 },
    );
  }

  const userId = (magic.metadata as { user_id?: string } | null)?.user_id;
  const email = magic.email ?? null;

  if (!userId || !email) {
    return NextResponse.json(
      { error: "Token missing user metadata." },
      { status: 400 },
    );
  }

  const { data: existing, error: profileError } = await supabaseServer
    .from("users_custom")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: "Could not load profile." },
      { status: 500 },
    );
  }

  if (!existing) {
    const { data: inserted, error: insertError } = await supabaseServer
      .from("users_custom")
      .insert([
        {
          id: userId,
          email,
          phone: "",
          full_name: "",
          q1: "",
          q2: "",
          q3: "",
          image1_path: null,
          image2_path: null,
          image3_path: null,
          image4_path: null,
          image5_path: null,
          image6_path: null,
          image7_path: null,
        },
      ])
      .select("*")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: "Could not create profile." },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile: inserted });
  }

  return NextResponse.json({ profile: existing });
}
