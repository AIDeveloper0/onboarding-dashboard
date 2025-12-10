"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ImageGrid, type SlotState } from "@/components/dashboard/ImageGrid";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { supabaseClient } from "@/lib/supabaseClient";
import type { UsersCustom } from "@/types/user";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const bucketName =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "uploads";

type ViewState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "ready"; user: { id: string; email: string | null } };

type Banner = { kind: "success" | "error"; message: string } | null;

function DashboardInner() {
  const [viewState, setViewState] = useState<ViewState>({ status: "loading" });
  const [profile, setProfile] = useState<UsersCustom | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>({});
  const [loadingProfile, setLoadingProfile] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const publicStorageBaseUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${base}/storage/v1/object/public`;
  }, []);

  const normalizeProfile = useCallback((row: UsersCustom): UsersCustom => {
    return {
      ...row,
      phone: row.phone ?? "",
      full_name: row.full_name ?? "",
      q1: row.q1 ?? "",
      q2: row.q2 ?? "",
      q3: row.q3 ?? "",
    };
  }, []);

  const loadOrCreateProfile = useCallback(
    async (user: { id: string; email: string | null }) => {
      setBanner(null);
      const { data, error } = await supabaseClient
        .from("users_custom")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setBanner({
          kind: "error",
          message: "Failed to fetch profile. Please try again.",
        });
        return;
      }

      if (data) {
        setProfile(normalizeProfile(data));
        return;
      }

      const { data: inserted, error: insertError } = await supabaseClient
        .from("users_custom")
        .insert([
          {
            id: user.id,
            email: user.email ?? null,
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
        setBanner({
          kind: "error",
          message: "Failed to create profile. Please try again.",
        });
        return;
      }

      setProfile(normalizeProfile(inserted));
    },
    [normalizeProfile],
  );

  const loadProfileWithState = useCallback(
    async (user: { id: string; email: string | null }) => {
      setLoadingProfile(true);
      try {
        await loadOrCreateProfile(user);
      } finally {
        setLoadingProfile(false);
      }
    },
    [loadOrCreateProfile],
  );

  useEffect(() => {
    async function bootstrap() {
      if (token) {
        const response = await fetch(`/api/dashboard?token=${token}`);
        const payload = (await response.json().catch(() => ({}))) as {
          profile?: UsersCustom;
          error?: string;
        };

        if (!response.ok || !payload.profile) {
          setViewState({ status: "unauthenticated" });
          setBanner({
            kind: "error",
            message: payload.error ?? "Invalid or expired token.",
          });
          return;
        }

        setViewState({
          status: "ready",
          user: { id: payload.profile.id, email: payload.profile.email },
        });
        setProfile(normalizeProfile(payload.profile));
        return;
      }

      const { data, error } = await supabaseClient.auth.getUser();
      if (error || !data.user) {
        setViewState({ status: "unauthenticated" });
        return;
      }
      setViewState({
        status: "ready",
        user: { id: data.user.id, email: data.user.email ?? null },
      });
    }
    void bootstrap();
  }, [normalizeProfile, token]);

  useEffect(() => {
    if (viewState.status !== "ready" || token) return;
    void loadProfileWithState(viewState.user);
  }, [loadProfileWithState, token, viewState]);

  function handleProfileChange(key: keyof UsersCustom, value: string) {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  }

  async function handleSaveProfile() {
    if (!profile || viewState.status !== "ready") return;
    setProfileSaving(true);
    setBanner(null);

    const payload = {
      phone: profile.phone?.trim() || null,
      full_name: profile.full_name?.trim() || null,
      q1: profile.q1?.trim() || null,
      q2: profile.q2?.trim() || null,
      q3: profile.q3?.trim() || null,
    };

    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, updates: payload }),
    });

    if (!response.ok) {
      setBanner({
        kind: "error",
        message: "Failed to update profile. Please try again.",
      });
      setProfileSaving(false);
      return;
    }

    setBanner({ kind: "success", message: "Profile updated successfully." });
    setProfileSaving(false);
  }

  function updateSlotState(slotIndex: number, partial: Partial<SlotState>) {
    setSlotStates((prev) => ({
      ...prev,
      [slotIndex]: {
        ...prev[slotIndex],
        ...partial,
        // default uploading to false when not provided
        uploading:
          partial.uploading !== undefined
            ? partial.uploading
            : prev[slotIndex]?.uploading ?? false,
      },
    }));
  }

  async function handleFileSelected(slotIndex: number, file: File) {
    if (!profile || viewState.status !== "ready") return;

    updateSlotState(slotIndex, { uploading: true, error: undefined, fileName: file.name });

    const extension = file.name.split(".").pop() || "bin";
    // Store path relative to the bucket (do not prefix the bucket name)
    const path = `${profile.id}/image${slotIndex}-${Date.now()}.${extension}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const payload = (await uploadResponse.json().catch(() => ({}))) as {
        error?: string;
      };
      updateSlotState(slotIndex, {
        uploading: false,
        error: payload.error ?? "Upload failed.",
      });
      return;
    }

    const fieldName = `image${slotIndex}_path` as keyof UsersCustom;
    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, updates: { [fieldName]: path } }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      data?: UsersCustom;
      error?: string;
    };

    if (!response.ok || !payload.data) {
      updateSlotState(slotIndex, {
        uploading: false,
        error: payload.error ?? "Could not save image path.",
      });
      return;
    }

    setProfile(normalizeProfile(payload.data));
    updateSlotState(slotIndex, { uploading: false, error: undefined });
  }

  if (viewState.status === "loading" || loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 text-slate-50">
        <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300/40 border-t-emerald-200" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (viewState.status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 text-slate-50">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
          <h1 className="text-lg font-semibold text-white">
            Not logged in
          </h1>
          <p className="mt-2 text-sm text-slate-200/80">
            Please use your magic link to access your dashboard.
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 text-slate-50">
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-50 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
          Unable to load profile. Please refresh the page.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pb-12 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Profile & media
            </h1>
            <p className="mt-1 text-sm text-slate-200/80">
              Edit your details and upload up to seven images.
            </p>
          </div>
        </header>

        <section className="space-y-6">
          <ProfileForm
            profile={profile}
            onChange={handleProfileChange}
            onSave={handleSaveProfile}
            saving={profileSaving}
            statusMessage={banner?.kind === "success" ? banner.message : ""}
            errorMessage={banner?.kind === "error" ? banner.message : ""}
          />

          <ImageGrid
            profile={profile}
            publicBaseUrl={publicStorageBaseUrl}
            bucketName={bucketName}
            slotStates={slotStates}
            onFileSelected={handleFileSelected}
          />
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
            Loading dashboard...
          </div>
        </main>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
