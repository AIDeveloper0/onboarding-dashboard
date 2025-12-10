import type { UsersCustom } from "@/types/user";

type Props = {
  profile: UsersCustom;
  onChange: (key: keyof UsersCustom, value: string) => void;
  onSave: () => void;
  saving: boolean;
  statusMessage?: string;
  errorMessage?: string;
};

export function ProfileForm({
  profile,
  onChange,
  onSave,
  saving,
  statusMessage,
  errorMessage,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Profile
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Account details
          </h2>
          <p className="mt-1 text-sm text-slate-200/80">
            Keep your contact and company info up to date.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {statusMessage && (
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-50">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-300/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-50">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-100">Email</span>
            <input
              value={profile.email ?? ""}
              readOnly
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-100">Phone</span>
            <input
              value={profile.phone ?? ""}
              onChange={(event) => onChange("phone", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-100">Name</span>
            <input
              value={profile.full_name ?? ""}
              onChange={(event) => onChange("full_name", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
              placeholder="Your full name"
              autoComplete="name"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-100">
              Company name (q1)
            </span>
            <input
              value={profile.q1 ?? ""}
              onChange={(event) => onChange("q1", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
              placeholder="Acme Co."
              autoComplete="organization"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-100">
              Website URL (q2)
            </span>
            <input
              value={profile.q2 ?? ""}
              onChange={(event) => onChange("q2", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
              placeholder="https://example.com"
              autoComplete="url"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-100">
            What services do you provide? (q3)
          </span>
          <textarea
            value={profile.q3 ?? ""}
            onChange={(event) => onChange("q3", event.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/70"
            placeholder="Describe your services..."
          />
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-900/30 border-t-emerald-900" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
