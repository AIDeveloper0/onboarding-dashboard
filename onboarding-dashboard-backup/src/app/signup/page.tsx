"use client";

import { useState, type FormEvent } from "react";

type FormState = {
  email: string;
  phone: string;
  fullName: string;
  company: string;
  website: string;
  services: string;
};

type FieldErrors = Partial<
  Record<keyof FormState | "general", string>
>;

export default function SignupPage() {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    phone: "",
    fullName: "",
    company: "",
    website: "",
    services: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [magicLinks, setMagicLinks] = useState<string[]>([]);
  const [infoMessage, setInfoMessage] = useState("");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setMagicLinks([]);
    setInfoMessage("");

    const validationErrors: FieldErrors = {};

    if (!formState.email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!emailPattern.test(formState.email.trim())) {
      validationErrors.email = "Enter a valid email address.";
    }

    if (!formState.fullName.trim()) {
      validationErrors.fullName = "Full name is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formState.email.trim(),
          phone: formState.phone.trim() || null,
          fullName: formState.fullName.trim(),
          company: formState.company.trim() || null,
          website: formState.website.trim() || null,
          services: formState.services.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        links?: string[];
        info?: string;
      };

      if (!response.ok) {
        const duplicate =
          payload.error?.includes("already registered") ||
          response.status === 409;
        if (duplicate) {
          setErrors({
            email:
              "This email is already registered. Please use a different email or go to your dashboard.",
          });
        } else {
          setErrors({
            general: payload.error ?? "Something went wrong. Please try again.",
          });
        }
        setStatus("idle");
        return;
      }

      setMagicLinks(payload.links ?? []);
      if (payload.info) setInfoMessage(payload.info);
      setStatus("success");
      setSuccessMessage(
        payload.message ??
          "Signup complete. Check your email for your magic links.",
      );
    } catch (error) {
      console.error("Error creating profile", error);
      setErrors({
        general: "Something went wrong. Please try again.",
      });
      setStatus("idle");
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12 text-slate-50">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.8)] backdrop-blur">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">
            Onboarding
          </p>
          <h1 className="text-3xl font-semibold text-white">Sign Up</h1>
          <p className="text-sm text-slate-200/80">
            Capture the same profile data we store in <code>users_custom</code>.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-2xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-50">
              {errors.general}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-300/70 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
              {successMessage}
            </div>
          )}

          {infoMessage && (
            <div className="rounded-2xl border border-indigo-300/70 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-50">
              {infoMessage}
            </div>
          )}

          {magicLinks.length > 0 && (
            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100">
              <p className="font-semibold text-white">
                Magic links (email send not configured):
              </p>
              <ul className="mt-2 space-y-1">
                {magicLinks.map((link) => (
                  <li key={link} className="break-all text-emerald-100">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Email <span className="text-red-200">*</span>
                </span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              {errors.email && (
                <p className="mt-2 text-sm text-red-200">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Phone
                </span>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
                />
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Full name <span className="text-red-200">*</span>
                </span>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </label>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-200">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Company name (q1)
                </span>
                <input
                  type="text"
                  value={formState.company}
                  onChange={(event) =>
                    updateField("company", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="Acme Co."
                  autoComplete="organization"
                />
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Website URL (q2)
                </span>
                <input
                  type="url"
                  value={formState.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="https://example.com"
                  autoComplete="url"
                />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  What services do you provide? (q3)
                </span>
                <textarea
                  value={formState.services}
                  onChange={(event) =>
                    updateField("services", event.target.value)
                  }
                  className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
                  placeholder="Describe your services..."
                  rows={4}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
          >
            {status === "submitting" ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}
