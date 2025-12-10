"use client";

export type UploadResponse = {
  path: string;
  publicUrl: string;
};

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as { error?: string } | null)?.error;
    throw new Error(error ?? "Unable to upload image.");
  }

  return payload as UploadResponse;
}

export async function updateUserProfile(
  userId: string,
  updates: Record<string, unknown>,
) {
  const response = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, updates }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as { error?: string } | null)?.error;
    throw new Error(error ?? "Unable to update profile.");
  }

  return (payload as { data?: unknown }).data;
}
