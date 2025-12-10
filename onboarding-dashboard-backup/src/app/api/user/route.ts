import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const tableName = process.env.SUPABASE_PROFILE_TABLE ?? "profiles";

export const runtime = "nodejs";

type PatchPayload = {
  id?: string;
  updates?: Record<string, unknown>;
};

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PatchPayload;
    const { id, updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "`id` is required to update the profile." },
        { status: 400 },
      );
    }

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json(
        { error: "`updates` must be an object with profile fields." },
        { status: 400 },
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one field to update." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseServer
      .from(tableName)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating profile", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 },
    );
  }
}
