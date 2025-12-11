"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

type FormState = {
  fullName: string;
  rabbiName: string;
  email: string;
  phone: string;
  shul: string;
  city: string;
  role: string;
  timeline: string;
  website: string;
  boardNeeds: string;
};

type FieldErrors = Partial<Record<keyof FormState | "general", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const demoDateText =
  "Yom Kippur - 10 Tishrei 5786 - Thursday, October 2, 2025";

const featureCards = [
  {
    title: "Live time, date, and Hebrew calendar",
    body:
      "Always-on display with current time, Gregorian date, Hebrew date, upcoming chagim, Rosh Chodesh, and special days so there is no manual luach work.",
    tagline: "Automatically adjusts for your time zone and daylight savings.",
    icon: "Calendar",
  },
  {
    title: "Zmanim and parasha of the week",
    body:
      "Accurate halachic times (alot, neitz, shema, tefilla, chatzot, shkiah, Rabbeinu Tam, and more) with parasha, candle lighting, and havdalah times.",
    tagline: "Location-aware and customizable per minhag.",
    icon: "Clock",
  },
  {
    title: "5-day local weather",
    body:
      "Integrated 5-day forecast for your city so people know what to expect before they step outside.",
    tagline: "Pulled from a reliable weather API and refreshed automatically.",
    icon: "Weather",
  },
  {
    title: "Shul schedule and shiurim",
    body:
      "Show daily minyan times, room assignments, and shiur schedules in a clean schedule panel tuned for quick reading.",
    tagline: "Manage from a browser; push changes instantly.",
    icon: "List",
  },
  {
    title: "Rotating photos and dedications",
    body:
      "Add sponsor slides, dedication plaques, and community photos. The system cycles through them between minyanim or in a dedicated at-rest layout.",
    tagline: "Ideal for fundraising campaigns and donor walls.",
    icon: "Gallery",
  },
  {
    title: "Emergency alert overlay",
    body:
      "Trigger an on-screen banner or full-screen overlay that immediately overrides the normal layout for security or weather events.",
    tagline: "Single-click alerts; visible on every connected screen.",
    icon: "Alert",
  },
];
const steps = [
  {
    title: "Connect any computer + TV",
    body:
      "Plug a mini PC, NUC, or thin client into your lobby TV, open the zmanim.tv display URL in a browser, and set it to auto-launch on boot.",
  },
  {
    title: "Configure your shul profile",
    body:
      "Choose your location, nusach, minyan schedule, and branding. The system will calculate zmanim and Hebrew dates automatically.",
  },
  {
    title: "Manage content from anywhere",
    body:
      "Use the admin console to update schedules, upload images, and trigger emergency alerts in real time without touching the screen in shul.",
  },
];

const weatherDays = [
  { label: "Today", icon: "Sun", temp: "78F", low: "Night - 62F" },
  { label: "Fri", icon: "Clouds", temp: "76F", low: "60F" },
  { label: "Shabbat", icon: "Sun/Cloud", temp: "74F", low: "59F" },
  { label: "Sun", icon: "Showers", temp: "71F", low: "58F" },
  { label: "Mon", icon: "Clouds", temp: "72F", low: "57F" },
];
const shulSchedule = [
  { label: "Shacharit", time: "8:30 AM", room: "Main Sanctuary" },
  { label: "Musaf", time: "10:15 AM", room: "Main Sanctuary" },
  { label: "Mincha", time: "4:30 PM", room: "Main Sanctuary" },
  { label: "Ne'ilah", time: "5:30 PM", room: "Main Sanctuary" },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SignupPage() {
  const [clockTime, setClockTime] = useState(() => formatTime(new Date()));
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    rabbiName: "",
    email: "",
    phone: "",
    shul: "",
    city: "",
    role: "",
    timeline: "",
    website: "",
    boardNeeds: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [magicLinks, setMagicLinks] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => setClockTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  const compiledServices = useMemo(() => {
    const details: string[] = [];

    if (formState.rabbiName) details.push(`Rabbi: ${formState.rabbiName}`);
    if (formState.city) details.push(`City: ${formState.city}`);
    if (formState.role) details.push(`Role: ${formState.role}`);
    if (formState.timeline) details.push(`Timeline: ${formState.timeline}`);
    if (formState.website) details.push(`Website: ${formState.website}`);

    const summary = formState.boardNeeds'.trim() || "";
    const extra = details.length > 0 ' `Details:\n${details.join("\n")}` : "";

    return [summary, extra].filter(Boolean).join("\n\n");
  }, [formState]);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setInfoMessage("");
    setMagicLinks([]);

    const validation: FieldErrors = {};

    if (!formState.email.trim()) {
      validation.email = "Email is required.";
    } else if (!emailPattern.test(formState.email.trim())) {
      validation.email = "Enter a valid email address.";
    }

    if (!formState.fullName.trim()) {
      validation.fullName = "Name is required.";
    }

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
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
          company: formState.shul.trim() || null,
          website: formState.website.trim() || null,
          services: compiledServices || null,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error': string;
        message': string;
        links': string[];
        info': string;
      };

      if (!response.ok) {
        const duplicate =
          payload.error'.includes("already registered") ||
          response.status === 409;
        if (duplicate) {
          setErrors({
            email:
              "This email is already registered. Please use a different email or go to your dashboard.",
          });
        } else {
          setErrors({
            general: payload.error '' "Something went wrong. Please try again.",
          });
        }
        setStatus("idle");
        return;
      }

      setMagicLinks(payload.links '' []);
      if (payload.info) setInfoMessage(payload.info);
      setStatus("success");
      setSuccessMessage(
        payload.message ''
          "Signup complete. Check your email for your magic links.",
      );
    } catch (error) {
      console.error("Signup error", error);
      setErrors({
        general: "Something went wrong. Please try again.",
      });
      setStatus("idle");
    }
  }

  function scrollToContact() {
    const anchor = document.getElementById("contact");
    if (anchor) anchor.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="page">
      <style jsx global>{`
        :root {
          --bg: #020617;
          --bg-elevated: #050816;
          --bg-soft: #080f24;
          --accent: #38bdf8;
          --accent-strong: #0ea5e9;
          --text-main: #f9fafb;
          --text-soft: #cbd5f5;
          --border-subtle: rgba(148, 163, 184, 0.35);
          --radius-lg: 18px;
          --radius-xl: 24px;
          --max-width: 1180px;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background: radial-gradient(
            circle at top left,
            #1f2937 0,
            #020617 52%,
            #000 100%
          );
          color: var(--text-main);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          border-bottom: 1px solid rgba(148, 163, 184, 0.25);
          backdrop-filter: blur(16px);
          background: linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0.96),
            rgba(15, 23, 42, 0.78)
          );
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .nav-inner {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-size: 1rem;
          text-transform: uppercase;
        }

        .logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: radial-gradient(
            circle at 30% 20%,
            #e0f2fe,
            #38bdf8 40%,
            #0b1120 80%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--text-soft);
        }

        .nav-links a {
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          transition: 0.15s ease;
        }

        .nav-links a:hover {
          background: rgba(15, 23, 42, 0.9);
          color: #e5e7eb;
        }

        .pill,
        .pill-neutral {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .pill {
          background: rgba(56, 189, 248, 0.1);
          color: var(--accent);
          border: 1px solid rgba(56, 189, 248, 0.5);
        }

        .pill-neutral {
          background: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          border: 1px solid rgba(148, 163, 184, 0.6);
        }

        .btn-primary {
          border-radius: 999px;
          border: none;
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(
            to right,
            var(--accent),
            var(--accent-strong)
          );
          color: #020617;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 16px 35px rgba(56, 189, 248, 0.38);
        }

        .btn-secondary-outline {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          padding: 0.5rem 1.1rem;
          font-size: 0.86rem;
          font-weight: 500;
          background: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        main {
          flex: 1;
        }

        .hero {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 3rem 1.5rem;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.05fr);
          gap: 2.5rem;
          align-items: center;
        }

        .hero-eyebrow {
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.6rem;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(2.3rem, 3.3vw, 2.9rem);
          line-height: 1.08;
        }

        .hero h1 .highlight {
          background: linear-gradient(to right, #e0f2fe, #38bdf8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          margin-top: 1.1rem;
          color: var(--text-soft);
          font-size: 1rem;
          line-height: 1.7;
          max-width: 34rem;
        }

        .hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.4rem;
          font-size: 0.8rem;
        }

        .hero-badges span {
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: rgba(15, 23, 42, 0.92);
          color: var(--text-soft);
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .hero-badges span strong {
          color: #e5e7eb;
          font-weight: 600;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1.1rem;
          margin-top: 1.9rem;
        }

        .hero-actions .secondary-link {
          font-size: 0.88rem;
          color: var(--text-soft);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.7rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        .hero-actions .secondary-link span {
          font-size: 1.1rem;
        }

        .trust-text,
        .beta-note-hero {
          margin-top: 1.2rem;
          font-size: 0.9rem;
          color: #9ca3af;
          max-width: 32rem;
          line-height: 1.6;
        }

        .trust-text strong {
          color: #e5e7eb;
        }

        .beta-note-hero span {
          color: #cbd5f5;
        }

        .section {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 2.4rem 1.5rem;
        }

        .section-header {
          max-width: 720px;
          margin-bottom: 1.4rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem;
          font-size: 1.8rem;
        }

        .section-header p {
          margin: 0;
          color: var(--text-soft);
          line-height: 1.6;
        }

        .demo-panel {
          background: radial-gradient(
            circle at top,
            #020617 0,
            #020617 45%,
            #000 100%
          );
          border-radius: var(--radius-xl);
          border: 1px solid rgba(148, 163, 184, 0.5);
          box-shadow: 0 22px 50px rgba(15, 23, 42, 0.85);
          padding: 1.4rem 1.35rem 1.75rem;
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.1rem;
          gap: 1rem;
        }

        .demo-title {
          font-size: 0.98rem;
          font-weight: 600;
        }

        .demo-location {
          font-size: 0.8rem;
          color: var(--text-soft);
        }

        .demo-time {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .demo-date {
          font-size: 0.85rem;
          color: var(--text-soft);
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .demo-card {
          background: rgba(8, 15, 36, 0.8);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(148, 163, 184, 0.4);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .demo-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
        }

        .tag {
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 0.78rem;
          color: var(--text-soft);
        }

        .zmanim-table {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr;
          gap: 0.35rem 0.6rem;
          font-size: 0.88rem;
        }

        .zman-label {
          color: var(--text-soft);
        }

        .zman-time {
          font-weight: 600;
        }

        .zman-note {
          color: #94a3b8;
          font-size: 0.82rem;
        }

        .parasha {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          font-size: 0.9rem;
          color: var(--text-soft);
          flex-wrap: wrap;
        }

        .parasha-title {
          color: #e5e7eb;
          font-weight: 600;
        }

        .demo-note {
          font-size: 0.78rem;
          color: #9ca3af;
          line-height: 1.5;
        }

        .weather-days {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.6rem;
        }

        .weather-day {
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 12px;
          padding: 0.7rem;
          display: grid;
          gap: 0.15rem;
          font-size: 0.9rem;
        }

        .w-icon {
          font-weight: 700;
        }

        .w-label {
          color: #cbd5f5;
          font-weight: 600;
        }

        .w-temp {
          font-weight: 700;
          font-size: 1rem;
        }

        .w-low {
          color: #9ca3af;
          font-size: 0.82rem;
        }

        .shul-schedule {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr;
          gap: 0.35rem;
          font-size: 0.88rem;
        }

        .shul-schedule .label {
          color: #cbd5f5;
        }

        .shul-schedule .time {
          font-weight: 700;
        }

        .shul-schedule .room {
          color: #94a3b8;
        }

        .shul-photo {
          display: flex;
          gap: 0.6rem;
          align-items: center;
        }

        .shul-photo-thumb {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea5e9, #22d3ee);
        }

        .shul-photo-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          color: #cbd5f5;
          font-size: 0.86rem;
        }

        .emergency-banner {
          margin-top: 1rem;
          border: 1px solid rgba(239, 68, 68, 0.6);
          border-radius: 14px;
          padding: 0.75rem 0.85rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.6rem;
          align-items: center;
          background: rgba(239, 68, 68, 0.08);
        }

        .emergency-icon {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.2);
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #fecdd3;
          border: 1px solid rgba(239, 68, 68, 0.6);
        }

        .emergency-text {
          color: #fecdd3;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .emergency-pill {
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          border: 1px solid rgba(239, 68, 68, 0.6);
          color: #fecdd3;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .feature-card,
        .step-card {
          background: var(--bg-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(56, 189, 248, 0.12);
          color: #e0f2fe;
          display: grid;
          place-items: center;
          font-size: 1.1rem;
          border: 1px solid rgba(56, 189, 248, 0.3);
          margin-bottom: 0.5rem;
        }

        .feature-card h3 {
          margin: 0 0 0.2rem;
          font-size: 1rem;
        }

        .feature-card p {
          margin: 0;
          color: var(--text-soft);
          line-height: 1.5;
        }

        .feature-tagline {
          font-size: 0.82rem;
          color: #9ca3af;
          margin-top: 0.35rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .step-number {
          font-size: 0.8rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.8);
          display: inline-block;
          margin-bottom: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #e5e7eb;
        }

        .step-card h3 {
          margin: 0 0 0.3rem;
          font-size: 1rem;
        }

        .step-card p {
          margin: 0;
          color: var(--text-soft);
          line-height: 1.6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 1.1fr);
          gap: 1.8rem;
          align-items: flex-start;
        }

        form {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          padding: 1.3rem 1.25rem 1.35rem;
          font-size: 0.92rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
          margin-bottom: 0.9rem;
        }

        .form-field {
          margin-bottom: 0.9rem;
        }

        label {
          display: block;
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
          color: var(--text-soft);
        }

        input,
        textarea,
        select {
          width: 100%;
          border-radius: 11px;
          border: 1px solid rgba(148, 163, 184, 0.82);
          background: #020617;
          color: #f9fafb;
          padding: 0.6rem 0.7rem;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
          transition: border 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease, transform 0.06s ease;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.7);
          background: #020617;
          transform: translateY(-0.5px);
        }

        textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.5;
        }

        .form-helper {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-top: 0.2rem;
        }

        .status-banner {
          border-radius: 12px;
          padding: 0.75rem 0.85rem;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
        }

        .status-heading {
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .status-error {
          border: 1px solid rgba(248, 113, 113, 0.6);
          background: rgba(248, 113, 113, 0.1);
          color: #fecdd3;
        }

        .status-success {
          border: 1px solid rgba(74, 222, 128, 0.6);
          background: rgba(74, 222, 128, 0.1);
          color: #dcfce7;
        }

        .status-info {
          border: 1px solid rgba(129, 140, 248, 0.6);
          background: rgba(129, 140, 248, 0.1);
          color: #e0e7ff;
        }

        .contact-note {
          font-size: 0.9rem;
          color: var(--text-soft);
          line-height: 1.7;
        }

        .contact-note ul {
          padding-left: 1.1rem;
          margin: 0.6rem 0 0;
        }

        .contact-note li {
          margin-bottom: 0.3rem;
        }

        footer {
          border-top: 1px solid rgba(148, 163, 184, 0.28);
          margin-top: 2.4rem;
          padding: 1.1rem 1.5rem 1.6rem;
          font-size: 0.8rem;
          color: #9ca3af;
          text-align: center;
        }

        .footer-inner {
          max-width: var(--max-width);
          margin: 0 auto;
          line-height: 1.6;
        }

        .footer-disclaimer {
          margin-top: 0.6rem;
          font-size: 0.74rem;
          color: #9ca3af;
          max-width: 52rem;
          margin-left: auto;
          margin-right: auto;
        }

        .donation-link {
          margin-top: 0.7rem;
          font-size: 0.85rem;
          color: #e5e7eb;
        }

        .donation-link a {
          color: #bae6fd;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .beta-disclaimer-inline {
          margin-top: 0.7rem;
          font-size: 0.78rem;
          color: #9ca3af;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: minmax(0, 1fr);
            padding-top: 2.3rem;
            padding-bottom: 2.7rem;
          }
          .demo-panel {
            order: -1;
          }
          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .contact-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 640px) {
          .nav-links {
            display: none;
          }
          .nav-inner {
            padding-inline: 1rem;
          }
          .hero {
            padding-inline: 1.1rem;
          }
          section {
            padding-inline: 1.1rem;
          }
          .feature-grid,
          .steps {
            grid-template-columns: minmax(0, 1fr);
          }
          .demo-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .demo-panel {
            padding-bottom: 3rem;
          }
          .emergency-banner {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header>
        <div className="nav-inner">
          <a href="#top" className="logo">
            <div className="logo-mark">ZT</div>
            <span>zmanim.tv</span>
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#contact">Book a demo</a>
            <a
              href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate
            </a>
          </nav>
          <div className="nav-cta">
            <span className="pill">Built for synagogues</span>
            <span className="pill-neutral">
              Beta - Complimentary for early adopters
            </span>
            <a
              href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-outline"
            >
              Support development
            </a>
            <button type="button" className="btn-primary" onClick={scrollToContact}>
              Request a demo <span>-&gt;</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div>
            <div className="hero-eyebrow">Hebrew calendar digital signage</div>
            <h1>
              Live <span className="highlight">zmanim, Hebrew dates, and alerts</span>
              <br />
              on every screen in your shul.
            </h1>
            <p className="hero-subtitle">
              zmanim.tv powers a dedicated display for your synagogue with real-time
              prayer times, full Hebrew calendar, 5-day forecast, parasha of the week,
              shul schedule, and emergency alerts - managed from a simple web console.
            </p>

            <div className="hero-badges">
              <span>
                <strong>Hebrew calendar aware</strong> - parasha, moadim, yomim tovim
              </span>
              <span>
                Auto-updated <strong>zmanim and minyan times</strong>
              </span>
              <span>
                <strong>Emergency overlay</strong> for security or weather notices
              </span>
            </div>

            <div className="hero-actions">
              <button type="button" className="btn-primary" onClick={scrollToContact}>
                Get early-access pricing <span>-&gt;</span>
              </button>
              <a href="#demo" className="secondary-link">
                See the live board layout <span>v</span>
              </a>
            </div>

            <div className="trust-text">
              Inspired by leading synagogue display systems, reimagined as a modern,
              browser-based platform you can run on <strong>any computer + TV</strong>.
            </div>

            <div className="beta-note-hero">
              <strong>Early-access program:</strong> we are currently operating in a
              controlled beta. Approved synagogues receive{" "}
              <span>complimentary usage during the beta</span> while we refine and harden
              the platform.
            </div>
          </div>
          <div id="demo" className="demo-panel">
            <div className="demo-header">
              <div>
                <div className="demo-title">Main Shul Lobby Display</div>
                <div className="demo-location">Beth Torah Synagogue - Los Angeles, CA</div>
              </div>
              <div>
                <div className="demo-time">{clockTime.toUpperCase()}</div>
                <div className="demo-date">{demoDateText}</div>
              </div>
            </div>

            <div className="demo-grid">
              <div className="demo-card">
                <div className="demo-card-header">
                  <strong>Yom Kippur Zmanim & Readings</strong>
                  <span className="tag">10 Tishrei 5786</span>
                </div>
                <div className="zmanim-table">
                  <div className="zman-label">Kol Nidrei (previous evening)</div>
                  <div className="zman-time">6:35 PM</div>
                  <div className="zman-note">Service start</div>

                  <div className="zman-label">Ne'ilah</div>
                  <div className="zman-time">5:30 PM</div>
                  <div className="zman-note">Final tefillah</div>

                  <div className="zman-label">Fast begins</div>
                  <div className="zman-time">6:20 PM</div>
                  <div className="zman-note">Wed, Oct 1</div>

                  <div className="zman-label">Fast ends</div>
                  <div className="zman-time">7:15 PM</div>
                  <div className="zman-note">Thu, Oct 2</div>

                  <div className="zman-label">Latest Shema (shacharit)</div>
                  <div className="zman-time">9:45 AM</div>
                  <div className="zman-note"></div>

                  <div className="zman-label">Yizkor</div>
                  <div className="zman-time">11:15 AM</div>
                  <div className="zman-note"></div>
                </div>

                <div className="parasha">
                  <div>
                    <div className="parasha-title">Yom Kippur Readings</div>
                    <div className="parasha-ref">Leviticus 16, Numbers 29; Jonah (Mincha)</div>
                  </div>
                  <div>
                    <div className="parasha-ref">Shacharit: 8:30 AM</div>
                    <div className="parasha-ref">Ne'ilah and shofar: ~7:10 PM</div>
                  </div>
                </div>

                <div className="demo-note">
                  Times shown here are for demonstration only. In production, all zmanim and fast
                  times are calculated automatically for your shul's exact location and minhag.
                </div>
              </div>

              <div className="demo-card">
                <div className="demo-card-header">
                  <strong>5-Day Forecast</strong>
                  <span className="tag">Local weather</span>
                </div>
                <div className="weather-days">
                  {weatherDays.map((day) => (
                    <div className="weather-day" key={day.label}>
                      <span className="w-label">{day.label}</span>
                      <span className="w-icon">{day.icon}</span>
                      <span className="w-temp">{day.temp}</span>
                      <span className="w-low">{day.low}</span>
                    </div>
                  ))}
                </div>

                <div className="shul-schedule">
                  {shulSchedule.map((item) => (
                    <Fragment key={item.label}>
                      <div className="label">{item.label}</div>
                      <div className="time">{item.time}</div>
                      <div className="room">{item.room}</div>
                    </Fragment>
                  ))}
                </div>

                <div className="shul-photo">
                  <div className="shul-photo-thumb" />
                  <div className="shul-photo-text">
                    <strong>Yamim Noraim layout</strong>
                    <span>
                      Highlight High Holy Day schedules, security guidance, and sponsorships in a
                      dedicated seasonal theme.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="emergency-banner">
              <div className="emergency-icon">!</div>
              <div className="emergency-text">
                <strong>Security advisory (demo).</strong>{" "}
                Please keep all exterior doors closed during Yom Kippur services. Follow instructions
                from security personnel.
              </div>
              <div className="emergency-pill">On-screen override</div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="section-header">
            <h2>Everything your shul needs</h2>
            <p>
              zmanim.tv takes the best ideas from synagogue displays and wraps them in a clean,
              modern layout that runs in any browser.
            </p>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => (
              <div className="feature-card" key={card.title}>
                <div className="feature-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className="feature-tagline">{card.tagline}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section">
          <div className="section-header">
            <h2>How it fits in</h2>
            <p>No proprietary hardware required.</p>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div className="step-card" key={step.title}>
                <div className="step-number">Step {index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="section">
          <div className="section-header">
            <h2>Get early-access pricing</h2>
            <p>Tell us about your shul and we will follow up.</p>
          </div>
          <div className="contact-grid">
            <form onSubmit={handleSubmit}>
              {errors.general ? (
                <div className="status-banner status-error">{errors.general}</div>
              ) : null}

              {successMessage ? (
                <div className="status-banner status-success">{successMessage}</div>
              ) : null}

              {infoMessage ? (
                <div className="status-banner status-info">{infoMessage}</div>
              ) : null}

              {magicLinks.length > 0 ? (
                <div className="status-banner status-info">
                  <div className="status-heading">Magic links (email not configured):</div>
                  <ul style={{ paddingLeft: "1rem", margin: "0.4rem 0 0" }}>
                    {magicLinks.map((link) => (
                      <li key={link} style={{ wordBreak: "break-all" }}>
                        {link}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="fullName">Your name *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formState.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Contact person"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="rabbiName">Rabbi's name</label>
                  <input
                    id="rabbiName"
                    name="rabbiName"
                    type="text"
                    value={formState.rabbiName}
                    onChange={(e) => updateField("rabbiName", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="shul">Shul / organization</label>
                  <input
                    id="shul"
                    name="shul"
                    type="text"
                    value={formState.shul}
                    onChange={(e) => updateField("shul", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formState.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="role">Your role</label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={formState.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="Rabbi, Executive Director, Gabbai, etc."
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="timeline">When do you want to start'</label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formState.timeline}
                    onChange={(e) => updateField("timeline", e.target.value)}
                  >
                    <option value="">Select a timeline</option>
                    <option>Within 30 days</option>
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>Just exploring options</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="website">Website (optional)</label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formState.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://example.org"
                    autoComplete="url"
                  />
                </div>
                <div className="form-field" />
              </div>

              <div className="form-field">
                <label htmlFor="boardNeeds">What should the board show'</label>
                <textarea
                  id="boardNeeds"
                  name="boardNeeds"
                  value={formState.boardNeeds}
                  onChange={(e) => updateField("boardNeeds", e.target.value)}
                  placeholder="Zmanim, minyan schedule, emergency alerts, dedications, etc."
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "submitting"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {status === "submitting" ' "Submitting..." : "Submit inquiry"} <span>-&gt;</span>
              </button>
            </form>
            <div className="contact-note">
              <p>With zmanim.tv you get a focused solution built for Jewish institutions:</p>
              <ul>
                <li>Full Hebrew calendar and parasha support, tuned for synagogue use.</li>
                <li>Dynamic zmanim and minyan schedules, including High Holy Day layouts.</li>
                <li>Runs in any modern browser - no proprietary player hardware required.</li>
                <li>Room for future modules: yahrzeit displays, donor walls, and more.</li>
                <li>Complimentary usage during the beta period for approved pilot sites.</li>
              </ul>
              <div className="donation-link">
                To support ongoing development of zmanim.tv, you may make a donation via Stripe:{" "}
                <a
                  href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://buy.stripe.com/00wdR89py6qMdtMeMX5os00
                </a>
                .
              </div>
              <div className="beta-disclaimer-inline">
                <strong>Beta testing notice:</strong> zmanim.tv is currently operating as a beta
                service. Functionality may change and defects may occur; the platform should not be
                treated as a sole source for safety-critical or time-critical decisions.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <div>
            (c) {year} zmanim.tv - Hebrew calendar digital signage for synagogues and Jewish
            institutions.
          </div>
          <div>
            Simple browser-based deployment - designed to run on any computer that can open a modern
            web browser.
          </div>
          <div className="footer-disclaimer">
            <strong>Beta testing disclaimer:</strong> zmanim.tv is currently in beta testing and may
            contain bugs, defects, or inaccuracies. The service, including all displayed times,
            dates, alerts, and content, is provided on an \"as-is\" and \"as-available\" basis without
            warranties of accuracy, availability, or fitness for a particular purpose. By using the
            service you agree we are not liable for errors, outages, or any loss or damage arising
            from reliance on the information shown on the displays.
          </div>
        </div>
      </footer>
    </div>
  );
}
