import type { Metadata } from "next";
import { ImageUploader } from "./components/ImageUploader";

export const metadata: Metadata = {
  title: "Onboarding Dashboard",
  description: "Upload assets to Supabase Storage and patch user profiles.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Onboarding Control
            </p>
            <h1 className="mt-1 text-4xl font-semibold text-white">
              Media & profile handoff
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200/80">
              Ship avatars to Supabase Storage, then fan out the public URL to
              your profile table without leaving the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-300/60 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-50">
              API ready
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white">
              Storage bucket:{" "}
              <strong className="font-semibold text-emerald-100">
                {process.env.SUPABASE_STORAGE_BUCKET ?? "uploads"}
              </strong>
            </span>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ImageUploader />

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">
                API map
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Handlers wired up
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-100/90">
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-200">
                    <span>POST</span>
                    <span>/api/upload</span>
                  </div>
                  <p className="mt-2 text-slate-100">
                    Accepts a FormData payload with{" "}
                    <code className="rounded bg-black/50 px-1 py-0.5 text-xs">
                      file
                    </code>{" "}
                    and stores it in Supabase Storage.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-indigo-200">
                    <span>PATCH</span>
                    <span>/api/user</span>
                  </div>
                  <p className="mt-2 text-slate-100">
                    Send{" "}
                    <code className="rounded bg-black/50 px-1 py-0.5 text-xs">
                      &#123; id, updates &#125;
                    </code>{" "}
                    to patch the profile row (table defaults to{" "}
                    <code className="rounded bg-black/50 px-1 py-0.5 text-xs">
                      profiles
                    </code>
                    ).
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-200">
                Setup
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Environment checklist
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-100/85">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    Client reads{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    and{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    Server routes use{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      SUPABASE_SERVICE_ROLE_KEY
                    </code>{" "}
                    (and optional{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      SUPABASE_STORAGE_BUCKET
                    </code>
                    ).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    Profile table defaults to{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      profiles
                    </code>
                    ; override with{" "}
                    <code className="rounded bg-black/40 px-1 py-0.5">
                      SUPABASE_PROFILE_TABLE
                    </code>
                    .
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
