import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "user-images";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const customPath = formData.get("path");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file is required under the `file` field." },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop() || "bin";
    const path =
      typeof customPath === "string" && customPath.length > 0
        ? customPath
        : `${bucketName}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseServer.storage
      .from(bucketName)
      .upload(path, fileBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      const status =
        (uploadError as { statusCode?: number }).statusCode ?? 500;
      return NextResponse.json(
        { error: uploadError.message },
        { status },
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
