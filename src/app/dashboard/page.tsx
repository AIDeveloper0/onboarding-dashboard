"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ImageGrid, type SlotState } from "@/components/dashboard/ImageGrid";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { supabaseClient } from "@/lib/supabaseClient";
import type { UsersCustom } from "@/types/user";

const bucketName =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "user-images";

type ViewState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "ready"; user: User };

type Banner = { kind: "success" | "error"; message: string } | null;

export default function DashboardPage() {
  const [viewState, setViewState] = useState<ViewState>({ status: "loading" });
  const [profile, setProfile] = useState<UsersCustom | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [slotStates, setSlotStates] = useState<Record<number, SlotState>>({});
  const [loadingProfile, setLoadingProfile] = useState(false);

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
    async (user: User) => {
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

  useEffect(() => {
    async function bootstrap() {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error || !data.user) {
        setViewState({ status: "unauthenticated" });
        return;
      }
      setViewState({ status: "ready", user: data.user });
    }
    void bootstrap();
  }, []);

  const loadProfileWithState = useCallback(
    async (user: User) => {
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
    if (viewState.status !== "ready") return;
    void loadProfileWithState(viewState.user);
  }, [loadProfileWithState, viewState]);

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

    const { error } = await supabaseClient
      .from("users_custom")
      .update(payload)
      .eq("id", profile.id);

    if (error) {
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
      [slotIndex]: { uploading: false, ...prev[slotIndex], ...partial },
    }));
  }

  async function handleFileSelected(slotIndex: number, file: File) {
    if (!profile || viewState.status !== "ready") return;

    updateSlotState(slotIndex, { uploading: true, error: undefined, fileName: file.name });

    const extension = file.name.split(".").pop() || "bin";
    const path = `user-images/${profile.id}/image${slotIndex}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      updateSlotState(slotIndex, {
        uploading: false,
        error: uploadError.message ?? "Upload failed.",
      });
      return;
    }

    const fieldName = `image${slotIndex}_path` as keyof UsersCustom;
    const { data, error: updateError } = await supabaseClient
      .from("users_custom")
      .update({ [fieldName]: path })
      .eq("id", profile.id)
      .select("*")
      .single();

    if (updateError || !data) {
      updateSlotState(slotIndex, {
        uploading: false,
        error: updateError?.message ?? "Could not save image path.",
      });
      return;
    }

    setProfile(normalizeProfile(data));
    updateSlotState(slotIndex, { uploading: false, error: undefined });
  }

  if (viewState.status === "loading" || loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (viewState.status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Not logged in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to access your dashboard.
          </p>
          <a
            href="/login"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center shadow-sm text-rose-700">
          Unable to load profile. Please refresh the page.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Profile & media
            </h1>
            <p className="mt-1 text-sm text-slate-600">
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
            slotStates={slotStates}
            onFileSelected={handleFileSelected}
          />
        </section>
      </div>
    </main>
  );
}
