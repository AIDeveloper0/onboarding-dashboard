"use client";
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  updateUserProfile,
  uploadImage,
  type UploadResponse,
} from "../upload-image";

export function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<
    { type: "idle" | "uploading" | "success" | "error"; message?: string }
  >({ type: "idle" });
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus({ type: "error", message: "Choose an image to upload first." });
      return;
    }

    setStatus({
      type: "uploading",
      message: "Uploading to Supabase Storage...",
    });

    try {
      const uploadResult = await uploadImage(file);
      setUploaded(uploadResult);

      if (userId.trim()) {
        const updates: Record<string, unknown> = {
          avatar_url: uploadResult.publicUrl,
        };

        if (fullName.trim()) {
          updates.full_name = fullName.trim();
        }

        await updateUserProfile(userId.trim(), updates);
      }

      setStatus({
        type: "success",
        message: userId
          ? "Image uploaded and profile updated."
          : "Image uploaded.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
            Media Ops
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            Upload & attach to profile
          </h3>
          <p className="mt-1 text-sm text-slate-200/80">
            Send an image to Supabase Storage and optionally patch the user
            record with the public URL.
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-200/30">
          Live
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 focus-within:border-emerald-300/80 focus-within:bg-white/10 focus-within:shadow-[0_10px_30px_-12px_rgba(16,185,129,0.6)]">
            <span className="text-xs uppercase tracking-wide text-slate-300">
              User ID (optional)
            </span>
            <input
              className="w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-400"
              placeholder="auth uid or profile id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="off"
            />
          </label>

          <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 focus-within:border-emerald-300/80 focus-within:bg-white/10 focus-within:shadow-[0_10px_30px_-12px_rgba(16,185,129,0.6)]">
            <span className="text-xs uppercase tracking-wide text-slate-300">
              Display name (optional)
            </span>
            <input
              className="w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-400"
              placeholder="e.g. Casey McKenzie"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="off"
            />
          </label>
        </div>

        <label className="flex flex-col gap-3 rounded-2xl border border-dashed border-emerald-200/50 bg-emerald-500/5 p-6 text-sm text-slate-100 transition hover:border-emerald-200 hover:bg-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                Image
              </p>
              <p className="text-lg font-semibold text-white">
                Drop or pick a file
              </p>
              <p className="text-sm text-emerald-50/70">
                PNG, JPG, or GIF up to 5MB.
              </p>
            </div>
            {previewUrl ? (
              <Image
                alt="Preview"
                src={previewUrl}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/70"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                <span className="text-xl">＋</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-input"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              if (chosen) {
                setFile(chosen);
                setUploaded(null);
                setStatus({ type: "idle" });
              }
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="image-input"
              className="cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Browse files
            </label>
            {file ? (
              <span className="text-sm text-emerald-50/90">
                Selected: <strong className="font-semibold">{file.name}</strong>
              </span>
            ) : (
              <span className="text-sm text-emerald-50/70">
                No file selected
              </span>
            )}
          </div>
        </label>

        {status.type === "error" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/60 bg-red-400/15 px-4 py-3 text-sm text-red-50">
            <span className="text-base">⚠️</span>
            <p>{status.message}</p>
          </div>
        )}

        {uploaded?.publicUrl && (
          <div className="flex flex-col gap-1 rounded-xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
              Uploaded
            </div>
            <p className="text-sm font-medium text-white">
              {uploaded.publicUrl}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status.type === "uploading"}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
          >
            {status.type === "uploading" ? "Uploading…" : "Upload image"}
          </button>
          {status.message && status.type !== "error" && (
            <p className="text-sm text-slate-100/80">{status.message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
