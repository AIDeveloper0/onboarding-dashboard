"use client";

import { useEffect, useMemo, useState } from "react";

type ZmanimKey =
  | "alotHaShachar"
  | "alot72"
  | "beinHashmashos"
  | "chatzot"
  | "chatzosNight"
  | "civilDawn"
  | "civilDusk"
  | "minchaGedola"
  | "minchaGedolaMGA"
  | "minchaKetana"
  | "minchaKetanaMGA"
  | "misheyakir"
  | "misheyakirMachmir"
  | "plagHaMincha"
  | "sunrise"
  | "sunset"
  | "sofZmanTfillaGRA"
  | "sofZmanTfillaMGA"
  | "sofZmanShacharitGRA"
  | "sofZmanShacharitMGA";

const ZMANIM_KEYS: ZmanimKey[] = [
  "alotHaShachar",
  "alot72",
  "beinHashmashos",
  "chatzot",
  "chatzosNight",
  "civilDawn",
  "civilDusk",
  "minchaGedola",
  "minchaGedolaMGA",
  "minchaKetana",
  "minchaKetanaMGA",
  "misheyakir",
  "misheyakirMachmir",
  "plagHaMincha",
  "sunrise",
  "sunset",
  "sofZmanTfillaGRA",
  "sofZmanTfillaMGA",
  "sofZmanShacharitGRA",
  "sofZmanShacharitMGA",
];

type ImageField = "logo" | "pic1" | "pic2" | "pic3" | "pic4" | "pic5" | "qr";

type AdminData = {
  synagogue?: string;
  rabbi?: string;
  location?: string;
  zipcode?: string;
  tv_key?: string;
  rabbi_msg?: string;
  shacharit1?: string;
  shacharit2?: string;
  mincha1?: string;
  mincha2?: string;
  ariv1?: string;
  ariv2?: string;
  shabbat_arvit1?: string;
  shabbat_arvit2?: string;
  shabbat_shacharit1?: string;
  shabbat_shacharit2?: string;
  shabbat_mincha1?: string;
  shabbat_mincha2?: string;
  tempCelsius?: boolean;
  layout_name?: string;
  image_transition_delay?: string;
  qr_holiday?: boolean;
  emergency_1?: string;
  emergency_2?: string;
  emergency_3?: string;
  emergency_4?: string;
  emergency_5?: string;
  zmanim?: Record<ZmanimKey, boolean>;
  images?: Partial<Record<ImageField, { name?: string; thumb?: string; full?: string }>>;
};

const initialZmanim = (): Record<ZmanimKey, boolean> =>
  ZMANIM_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as Record<ZmanimKey, boolean>);

const initialData: AdminData = {
  rabbi_msg: "",
  image_transition_delay: "30",
  layout_name: "",
  tempCelsius: false,
  qr_holiday: false,
  zmanim: initialZmanim(),
  images: {},
};

const labels: Record<ZmanimKey, string> = {
  alotHaShachar: "Alot HaShachar",
  alot72: "Alot 72",
  beinHashmashos: "Bein Hashmashos",
  chatzot: "Chatzot",
  chatzosNight: "Chatzos (night)",
  civilDawn: "Civil dawn",
  civilDusk: "Civil dusk",
  minchaGedola: "Mincha Gedola",
  minchaGedolaMGA: "Mincha Gedola (MGA)",
  minchaKetana: "Mincha Ketana",
  minchaKetanaMGA: "Mincha Ketana (MGA)",
  misheyakir: "Misheyakir",
  misheyakirMachmir: "Misheyakir (machmir)",
  plagHaMincha: "Plag HaMincha",
  sunrise: "Sunrise",
  sunset: "Sunset",
  sofZmanTfillaGRA: "Sof Zman Tefilla (GRA)",
  sofZmanTfillaMGA: "Sof Zman Tefilla (MGA)",
  sofZmanShacharitGRA: "Sof Zman Shacharit (GRA)",
  sofZmanShacharitMGA: "Sof Zman Shacharit (MGA)",
};

const imageFields: { key: ImageField; label: string }[] = [
  { key: "logo", label: "Logo" },
  { key: "pic1", label: "Picture 1" },
  { key: "pic2", label: "Picture 2" },
  { key: "pic3", label: "Picture 3" },
  { key: "pic4", label: "Picture 4" },
  { key: "pic5", label: "Picture 5" },
  { key: "qr", label: "QR Code for Zelle Deposit" },
];

function fieldLabel(key: ImageField) {
  return imageFields.find((f) => f.key === key)?.label ?? key;
}

export default function AdminConsolePage() {
  const [adminKey, setAdminKey] = useState("");
  const [data, setData] = useState<AdminData>(initialData);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [layouts, setLayouts] = useState<string[]>([]);
  const [emergencyCompanies, setEmergencyCompanies] = useState<string[]>([]);
  const [uploading, setUploading] = useState<Record<ImageField, boolean>>({} as Record<ImageField, boolean>);

  const hasLoadedProfile = useMemo(() => Boolean(data.synagogue || data.tv_key), [data.synagogue, data.tv_key]);

  useEffect(() => {
    if (!adminKey) return;
    const controller = new AbortController();
    const fetchLists = async () => {
      try {
        const [layoutsRes, companiesRes] = await Promise.allSettled([
          fetch(`/api/layouts/${adminKey}`, { signal: controller.signal }),
          fetch(`/api/emergency-companies/${adminKey}`, { signal: controller.signal }),
        ]);
        if (layoutsRes.status === "fulfilled" && layoutsRes.value.ok) {
          const json = await layoutsRes.value.json();
          if (Array.isArray(json)) setLayouts(json);
        }
        if (companiesRes.status === "fulfilled" && companiesRes.value.ok) {
          const json = await companiesRes.value.json();
          if (Array.isArray(json)) setEmergencyCompanies(json.map((c) => (typeof c === "string" ? c : c.name)));
        }
      } catch {
        /* ignore background errors */
      }
    };
    fetchLists();
    return () => controller.abort();
  }, [adminKey]);

  const handleLoad = async () => {
    if (!adminKey) {
      setMessage("Enter an admin key to load.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/load/${adminKey}`);
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      if (json?.error) throw new Error(json.error);

      const loadedZmanim = { ...initialZmanim() };
      ZMANIM_KEYS.forEach((key) => {
        const val = json?.[key];
        loadedZmanim[key] = Boolean(val);
      });

      const images: Partial<Record<ImageField, { name?: string; thumb?: string; full?: string }>> = {};
      imageFields.forEach(({ key }) => {
        const file = json?.[`${key}_path`];
        const full = json?.[`${key}_path_full`];
        const thumb = json?.[`${key}_path_thumb`];
        images[key] = file ? { name: file, full, thumb } : undefined;
      });

      setData({
        synagogue: json.synagogue,
        rabbi: json.rabbi,
        location: json.location,
        zipcode: json.zipcode,
        tv_key: json.tv_key,
        rabbi_msg: json.rabbi_msg ?? "",
        shacharit1: json.shacharit1 ?? "",
        shacharit2: json.shacharit2 ?? "",
        mincha1: json.mincha1 ?? "",
        mincha2: json.mincha2 ?? "",
        ariv1: json.ariv1 ?? "",
        ariv2: json.ariv2 ?? "",
        shabbat_arvit1: json.shabbat_arvit1 ?? "",
        shabbat_arvit2: json.shabbat_arvit2 ?? "",
        shabbat_shacharit1: json.shabbat_shacharit1 ?? "",
        shabbat_shacharit2: json.shabbat_shacharit2 ?? "",
        shabbat_mincha1: json.shabbat_mincha1 ?? "",
        shabbat_mincha2: json.shabbat_mincha2 ?? "",
        tempCelsius: Boolean(json.tempCelsius),
        layout_name: json.layout_name ?? "",
        image_transition_delay: json.image_transition_delay ?? "30",
        qr_holiday: Boolean(json.qr_holiday),
        emergency_1: json.emergency_1 ?? "",
        emergency_2: json.emergency_2 ?? "",
        emergency_3: json.emergency_3 ?? "",
        emergency_4: json.emergency_4 ?? "",
        emergency_5: json.emergency_5 ?? "",
        zmanim: loadedZmanim,
        images,
      });
      setMessage("Profile loaded.");
    } catch (e: any) {
      setMessage(e?.message || "Failed to load profile.");
    } finally {
      setBusy(false);
    }
  };

  const updateField = (key: keyof AdminData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateZmanim = (key: ZmanimKey, value: boolean) => {
    setData((prev) => ({ ...prev, zmanim: { ...(prev.zmanim ?? initialZmanim()), [key]: value } }));
  };

  const handleZmanimToggleAll = (value: boolean) => {
    const next = initialZmanim();
    ZMANIM_KEYS.forEach((key) => {
      next[key] = value;
    });
    setData((prev) => ({ ...prev, zmanim: next }));
  };

  const handleSave = async () => {
    if (!adminKey) {
      setMessage("Enter an admin key before saving.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const payload: any = { ...data, ...((data.zmanim as Record<string, boolean>) || {}) };
      delete payload.images;
      delete payload.zmanim;
      const res = await fetch(`/api/save/${adminKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Failed to save");
      setMessage("Saved successfully.");
    } catch (e: any) {
      setMessage(e?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (field: ImageField, file: File | null) => {
    if (!adminKey || !file) {
      setMessage("Select a file and ensure admin key is set.");
      return;
    }
    setUploading((prev) => ({ ...prev, [field]: true }));
    setMessage(null);
    try {
      const form = new FormData();
      form.append(field, file);
      const res = await fetch(`/api/upload/${adminKey}`, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Upload failed");
      const uploaded = json.uploaded?.[field];
      if (uploaded) {
        setData((prev) => ({
          ...prev,
          images: {
            ...(prev.images ?? {}),
            [field]: {
              name: uploaded.name,
              full: `${uploaded.tv_key}/${uploaded.name}`,
              thumb: `${uploaded.tv_key}/thumbs/${uploaded.name}`,
            },
          },
        }));
      }
      setMessage(`${fieldLabel(field)} uploaded.`);
    } catch (e: any) {
      setMessage(e?.message || "Upload failed.");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleDeleteImage = async (field: ImageField) => {
    if (!adminKey) {
      setMessage("Admin key required.");
      return;
    }
    setUploading((prev) => ({ ...prev, [field]: true }));
    setMessage(null);
    try {
      const res = await fetch(`/api/delete-pic/${adminKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || "Delete failed");
      setData((prev) => ({
        ...prev,
        images: { ...(prev.images ?? {}), [field]: undefined },
      }));
      setMessage(`${fieldLabel(field)} removed.`);
    } catch (e: any) {
      setMessage(e?.message || "Delete failed.");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleTestEmergency = async () => {
    if (!adminKey) {
      setMessage("Admin key required for test emergency.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/test-emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey }),
      });
      if (!res.ok) throw new Error("Failed to trigger test emergency");
      setMessage("Test emergency triggered.");
    } catch (e: any) {
      setMessage(e?.message || "Test emergency failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshTv = async () => {
    if (!data.tv_key) {
      setMessage("TV key missing.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/refresh-tv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tv_key: data.tv_key }),
      });
      if (!res.ok) throw new Error("Failed to refresh TV");
      setMessage("TV refresh requested.");
    } catch (e: any) {
      setMessage(e?.message || "TV refresh failed.");
    } finally {
      setBusy(false);
    }
  };

  const renderImageThumb = (field: ImageField) => {
    const entry = data.images?.[field];
    if (!entry?.thumb && !entry?.full) return null;
    const src = entry.thumb || entry.full;
    return (
      <div className="thumb">
        <img src={src} alt={fieldLabel(field)} />
      </div>
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-header">Zmanim Admin Console</header>

      <div className="container">
        <div className="load-row">
          <div className="load-controls">
            <label className="admin-label">
              Admin key
              <input
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                autoComplete="off"
              />
            </label>
            <button className="btn" onClick={handleLoad} disabled={busy}>
              {busy ? "Working..." : "Load profile"}
            </button>
          </div>
          {message && <div className="status">{message}</div>}
        </div>

        {hasLoadedProfile && (
          <section className="card">
            <h2>Synagogue Profile</h2>
            <div className="info-grid">
              <div className="profile-left">
                <div>
                  <strong>Synagogue:</strong> <span>{data.synagogue || "—"}</span>
                </div>
                <div>
                  <strong>Rabbi:</strong> <span>{data.rabbi || "—"}</span>
                </div>
                <div>
                  <strong>Location:</strong> <span>{data.location || "—"}</span>
                </div>
                <div>
                  <strong>Zipcode:</strong> <span>{data.zipcode || "—"}</span>
                </div>
                <div>
                  <strong>TV Key:</strong> <span>{data.tv_key || "—"}</span>
                </div>
              </div>
              <div className="profile-right">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <label key={slot}>
                    Emergency {slot}
                    <select
                      value={(data as any)[`emergency_${slot}`] ?? ""}
                      onChange={(e) => updateField(`emergency_${slot}` as keyof AdminData, e.target.value)}
                    >
                      <option value=""></option>
                      {emergencyCompanies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
            <div className="toggle">
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(data.tempCelsius)}
                  onChange={(e) => updateField("tempCelsius", e.target.checked)}
                />
                Display Temperature in Celsius
              </label>
            </div>
          </section>
        )}

        <section className="card">
          <h2>Content & Schedules</h2>

          <label className="admin-label">
            Rabbi Message
            <textarea
              rows={3}
              value={data.rabbi_msg ?? ""}
              onChange={(e) => updateField("rabbi_msg", e.target.value)}
              placeholder="Type message..."
            />
          </label>

          <h3>Weekday Times</h3>
          <div className="grid">
            <label>
              Shacharit 1 <input type="time" value={data.shacharit1 ?? ""} onChange={(e) => updateField("shacharit1", e.target.value)} />
            </label>
            <label>
              Shacharit 2 <input type="time" value={data.shacharit2 ?? ""} onChange={(e) => updateField("shacharit2", e.target.value)} />
            </label>
            <label>
              Mincha 1 <input type="time" value={data.mincha1 ?? ""} onChange={(e) => updateField("mincha1", e.target.value)} />
            </label>
            <label>
              Mincha 2 <input type="time" value={data.mincha2 ?? ""} onChange={(e) => updateField("mincha2", e.target.value)} />
            </label>
            <label>
              Arvit 1 <input type="time" value={data.ariv1 ?? ""} onChange={(e) => updateField("ariv1", e.target.value)} />
            </label>
            <label>
              Arvit 2 <input type="time" value={data.ariv2 ?? ""} onChange={(e) => updateField("ariv2", e.target.value)} />
            </label>
          </div>

          <h3>Shabbat Times</h3>
          <div className="grid">
            <label>
              Arvit 1{" "}
              <input
                type="time"
                value={data.shabbat_arvit1 ?? ""}
                onChange={(e) => updateField("shabbat_arvit1", e.target.value)}
              />
            </label>
            <label>
              Arvit 2{" "}
              <input
                type="time"
                value={data.shabbat_arvit2 ?? ""}
                onChange={(e) => updateField("shabbat_arvit2", e.target.value)}
              />
            </label>
            <label>
              Shacharit 1{" "}
              <input
                type="time"
                value={data.shabbat_shacharit1 ?? ""}
                onChange={(e) => updateField("shabbat_shacharit1", e.target.value)}
              />
            </label>
            <label>
              Shacharit 2{" "}
              <input
                type="time"
                value={data.shabbat_shacharit2 ?? ""}
                onChange={(e) => updateField("shabbat_shacharit2", e.target.value)}
              />
            </label>
            <label>
              Mincha 1{" "}
              <input
                type="time"
                value={data.shabbat_mincha1 ?? ""}
                onChange={(e) => updateField("shabbat_mincha1", e.target.value)}
              />
            </label>
            <label>
              Mincha 2{" "}
              <input
                type="time"
                value={data.shabbat_mincha2 ?? ""}
                onChange={(e) => updateField("shabbat_mincha2", e.target.value)}
              />
            </label>
          </div>

          <h3>Zmanim</h3>
          <div className="zmanim-card">
            <div className="zmanim-toolbar">
              <span className="muted">Toggle the items you want to display</span>
              <div className="z-actions">
                <button type="button" className="z-btn" onClick={() => handleZmanimToggleAll(true)}>
                  Select All
                </button>
                <button type="button" className="z-btn ghost" onClick={() => handleZmanimToggleAll(false)}>
                  Clear
                </button>
              </div>
            </div>
            <div className="z-grid" aria-label="Zmanim options">
              {ZMANIM_KEYS.map((key) => (
                <label key={key} className="z-item">
                  <input
                    className="z-check"
                    type="checkbox"
                    checked={Boolean(data.zmanim?.[key])}
                    onChange={(e) => updateZmanim(key, e.target.checked)}
                  />
                  <div className="z-box" aria-hidden />
                  <div className="z-title">{labels[key]}</div>
                </label>
              ))}
            </div>
          </div>

          <h3>Media Uploads <span className="muted">(auto-upload on select)</span></h3>
          <div className="grid">
            {imageFields.map(({ key }) => (
              <div key={key}>
                <strong>{fieldLabel(key)}</strong>
                <br />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(key, e.target.files?.[0] ?? null)}
                  disabled={uploading[key]}
                />
                {renderImageThumb(key)}
                {data.images?.[key] && (
                  <button type="button" className="delete-btn" onClick={() => handleDeleteImage(key)} disabled={uploading[key]}>
                    {uploading[key] ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="transition-group">
            <label>
              Image Transition Delay (seconds)
              <select
                id="image_transition_delay"
                value={data.image_transition_delay ?? "30"}
                onChange={(e) => updateField("image_transition_delay", e.target.value)}
              >
                {["15", "30", "45", "60", "90", "120"].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="qr-group">
            <label>
              <input
                type="checkbox"
                checked={Boolean(data.qr_holiday)}
                onChange={(e) => updateField("qr_holiday", e.target.checked)}
              />{" "}
              Hide QR on Holidays
            </label>
          </div>

          <label className="admin-label">
            Layout
            <select value={data.layout_name ?? ""} onChange={(e) => updateField("layout_name", e.target.value)}>
              <option value="">Select layout</option>
              {layouts.map((layout) => (
                <option key={layout} value={layout}>
                  {layout}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <button id="saveBtn" className="btn" onClick={handleSave} disabled={busy}>
              Save Changes
            </button>
            <button
              id="openTVBtn"
              className="btn secondary"
              onClick={() => {
                if (data.tv_key) window.open(`/tv/${data.tv_key}`, "_blank");
              }}
              disabled={!data.tv_key}
            >
              Open TV View
            </button>
            <button id="testEmergencyBtn" className="btn" onClick={handleTestEmergency} disabled={busy}>
              Test Emergency
            </button>
            <button className="btn ghost" onClick={handleRefreshTv} disabled={busy || !data.tv_key}>
              Refresh TV
            </button>
          </div>
        </section>
      </div>

      <style jsx global>{`
        :root {
          --accent: #2a4365;
          --accent-2: #3c6ea6;
          --bg: #f7fafc;
          --card: #ffffff;
          --border: #e2e8f0;
          --muted: #718096;
        }
        .admin-page {
          min-height: 100vh;
          background: var(--bg);
          color: #1a202c;
        }
        .admin-header {
          background: var(--accent);
          color: #fff;
          padding: 1.1rem 2rem;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 600;
          letter-spacing: 0.2px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .container {
          max-width: 1140px;
          margin: 2rem auto;
          padding: 0 1rem 3rem;
        }
        .load-row {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .load-controls {
          display: flex;
          gap: 0.7rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .status {
          background: #fff;
          border: 1px solid var(--border);
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          color: #2d3748;
          font-size: 0.95rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.6rem;
          margin-bottom: 1.6rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }
        h2 {
          margin: 0 0 1rem;
          color: var(--accent);
          font-weight: 700;
        }
        h3 {
          margin: 1.2rem 0 0.6rem;
          color: #2d3748;
        }
        label {
          font-weight: 500;
        }
        .admin-label {
          display: block;
          margin-top: 0.8rem;
        }
        input,
        textarea,
        select {
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e0;
          font-size: 0.95rem;
          width: 100%;
          box-sizing: border-box;
          transition: border 0.15s, box-shadow 0.15s;
          background: #fff;
        }
        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: var(--accent-2);
          box-shadow: 0 0 0 2px rgba(60, 110, 166, 0.2);
        }
        textarea {
          resize: vertical;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          align-items: end;
        }
        .info-grid {
          line-height: 1.7;
          display: flex;
          justify-content: space-between;
          gap: 1.2rem;
        }
        .profile-left {
          flex: 1;
        }
        .profile-right {
          flex: 1;
          padding-left: 20px;
        }
        .muted {
          color: var(--muted);
        }
        .zmanim-card {
          border: 1px solid var(--border);
          border-radius: 14px;
          background: #fff;
          padding: 16px;
        }
        .zmanim-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .z-actions {
          display: flex;
          gap: 8px;
        }
        .z-btn {
          border: 1px solid var(--border);
          background: #f8fafc;
          color: #1a202c;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .z-btn:hover {
          background: #eef2f7;
        }
        .z-btn.ghost {
          background: #fff;
        }
        .z-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
          gap: 12px;
        }
        .z-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #fafbfc;
          transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
          user-select: none;
          cursor: pointer;
          position: relative;
        }
        .z-item:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e0;
        }
        .z-title {
          font-size: 0.92rem;
          text-align: center;
          color: #2d3748;
          line-height: 1.2;
        }
        .z-check {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .z-box {
          width: 58px;
          height: 44px;
          border: 2px solid #cbd5e0;
          border-radius: 10px;
          background: #fff;
          position: relative;
          transition: all 0.15s;
        }
        .z-check:focus + .z-box {
          outline: 2px solid rgba(60, 110, 166, 0.25);
          outline-offset: 2px;
        }
        .z-item:hover .z-box {
          border-color: #a0aec0;
        }
        .z-check:checked + .z-box {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.15);
        }
        .z-check:checked + .z-box::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 8px;
          border: 3px solid #fff;
          border-top: none;
          border-left: none;
          transform: translate(-50%, -55%) rotate(45deg);
        }
        .thumb img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #cbd5e0;
          margin-top: 0.4rem;
        }
        .thumb {
          margin-top: 0.4rem;
          text-align: center;
        }
        .delete-btn {
          background: #e53e3e;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 6px 10px;
          margin-top: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .delete-btn:hover {
          background: #c53030;
        }
        .actions {
          margin-top: 1.1rem;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }
        .btn {
          background: var(--accent-2);
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .btn:hover {
          background: #2b579a;
        }
        .btn.secondary {
          background: #4a5568;
        }
        .btn.ghost {
          background: #f1f5f9;
          color: #1a202c;
        }
        .hidden {
          display: none;
        }
        .transition-group {
          margin-top: 10px;
        }
        .qr-group {
          margin: 20px 0;
          border: 1px solid var(--border);
          padding: 10px;
          border-radius: 8px;
        }
        .toggle {
          margin-top: 1rem;
        }
        @media (max-width: 720px) {
          .info-grid {
            flex-direction: column;
            padding-left: 4px;
          }
          .profile-right {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
