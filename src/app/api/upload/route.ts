import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file is required under the `file` field." },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop() || "bin";
    const path = `uploads/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseServer.storage
      .from(bucketName)
      .upload(path, fileBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: uploadError.statusCode ?? 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabaseServer.storage.from(bucketName).getPublicUrl(path);

    return NextResponse.json({ path, publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file to Supabase Storage", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 },
    );
  }
}
