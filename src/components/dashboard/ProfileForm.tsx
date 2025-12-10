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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Profile
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Account details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your contact and company info up to date.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {statusMessage && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={profile.email ?? ""}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-emerald-200"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              value={profile.phone ?? ""}
              onChange={(event) => onChange("phone", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              value={profile.full_name ?? ""}
              onChange={(event) => onChange("full_name", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="Your full name"
              autoComplete="name"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Company name (q1)
            </span>
            <input
              value={profile.q1 ?? ""}
              onChange={(event) => onChange("q1", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="Acme Co."
              autoComplete="organization"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Website URL (q2)
            </span>
            <input
              value={profile.q2 ?? ""}
              onChange={(event) => onChange("q2", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="https://example.com"
              autoComplete="url"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">
            What services do you provide? (q3)
          </span>
          <textarea
            value={profile.q3 ?? ""}
            onChange={(event) => onChange("q3", event.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
            placeholder="Describe your services..."
          />
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-900/40 border-t-emerald-900" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
