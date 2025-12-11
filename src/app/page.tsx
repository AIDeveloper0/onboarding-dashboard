"use client";

import { useEffect, useState } from "react";

const demoDateText = "Yom Kippur - 10 Tishrei 5786 - Thursday, October 2, 2025";

const weatherDays = [
  { label: "Today", icon: "☀️", temp: "78°F", low: "Night · 62°F" },
  { label: "Fri", icon: "🌤️", temp: "76°F", low: "60°F" },
  { label: "Shabbat", icon: "☁️", temp: "74°F", low: "59°F" },
  { label: "Sun", icon: "🌦️", temp: "71°F", low: "58°F" },
  { label: "Mon", icon: "🌤️", temp: "72°F", low: "57°F" },
];

const schedule = [
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

export default function HomePage() {
  const [clockTime, setClockTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClockTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        :root {
          --bg: #020617;
          --bg-elevated: #050816;
          --bg-soft: #080f24;
          --accent: #38bdf8;
          --accent-soft: rgba(56, 189, 248, 0.09);
          --accent-strong: #0ea5e9;
          --danger: #f97373;
          --text-main: #f9fafb;
          --text-soft: #cbd5f5;
          --border-subtle: rgba(148, 163, 184, 0.35);
          --radius-lg: 18px;
          --radius-xl: 24px;
          --shadow-soft: 0 22px 50px rgba(15, 23, 42, 0.85);
          --max-width: 1180px;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          background: radial-gradient(circle at top left, #1f2937 0, #020617 52%, #000 100%);
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
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
          gap: 1.5rem;
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
          background: radial-gradient(circle at 30% 20%, #e0f2fe, #38bdf8 40%, #0b1120 80%);
          box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.45);
          display: grid;
          place-items: center;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .nav-links {
          display: flex;
          gap: 1.2rem;
          font-size: 0.9rem;
          color: var(--text-soft);
        }

        .nav-links a {
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          transition: background 0.15s ease, color 0.15s ease, transform 0.08s ease;
        }

        .nav-links a:hover {
          background: rgba(15, 23, 42, 0.9);
          color: #e5e7eb;
          transform: translateY(-1px);
        }

        .nav-cta {
          display: flex;
          gap: 0.7rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .pill {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          border: 1px solid rgba(56, 189, 248, 0.5);
          white-space: nowrap;
        }

        .pill-neutral {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          border: 1px solid rgba(148, 163, 184, 0.6);
          white-space: nowrap;
        }

        .btn-primary {
          border-radius: 999px;
          border: none;
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(to right, var(--accent), var(--accent-strong));
          color: #020617;
          cursor: pointer;
          box-shadow: 0 16px 35px rgba(56, 189, 248, 0.38);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: transform 0.09s ease, box-shadow 0.09s ease, filter 0.09s ease;
          white-space: nowrap;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 40px rgba(56, 189, 248, 0.5);
          filter: brightness(1.05);
        }

        .btn-secondary-outline {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          padding: 0.5rem 1.1rem;
          font-size: 0.86rem;
          font-weight: 500;
          background: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.12s ease, border-color 0.12s ease, transform 0.08s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-secondary-outline:hover {
          background: rgba(15, 23, 42, 0.98);
          border-color: #e5e7eb;
          transform: translateY(-1px);
        }

        main {
          flex: 1;
        }

        .hero {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 3.25rem 1.5rem 3.25rem;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.05fr);
          gap: 3rem;
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
          font-size: clamp(2.3rem, 3.3vw, 2.9rem);
          line-height: 1.08;
          margin: 0;
        }

        .hero h1 span.highlight {
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
          transition: background 0.12s ease, transform 0.08s ease;
        }

        .hero-actions .secondary-link span {
          font-size: 1.1rem;
        }

        .hero-actions .secondary-link:hover {
          background: rgba(15, 23, 42, 0.95);
          transform: translateY(-1px);
        }

        .trust-text {
          margin-top: 1.2rem;
          font-size: 0.8rem;
          color: #9ca3af;
          max-width: 32rem;
          line-height: 1.6;
        }

        .trust-text strong {
          color: #e5e7eb;
        }

        .beta-note-hero {
          margin-top: 0.6rem;
          font-size: 0.8rem;
          color: #e5e7eb;
          max-width: 32rem;
          line-height: 1.6;
        }

        .beta-note-hero span {
          color: #cbd5f5;
        }

        .demo-panel {
          background: radial-gradient(circle at top, #020617 0, #020617 45%, #000 100%);
          border-radius: var(--radius-xl);
          border: 1px solid rgba(148, 163, 184, 0.5);
          box-shadow: var(--shadow-soft);
          padding: 1.4rem 1.35rem 2.6rem;
          position: relative;
          overflow: hidden;
        }

        .demo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.1rem;
          gap: 1rem;
        }

        .demo-header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .demo-title {
          font-size: 0.98rem;
          font-weight: 600;
        }

        .demo-location {
          font-size: 0.8rem;
          color: var(--text-soft);
        }

        .demo-header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.2rem;
          font-size: 0.8rem;
          color: var(--text-soft);
          text-align: right;
        }

        .demo-time {
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .demo-date {
          font-size: 0.8rem;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1rem;
          margin-top: 0.35rem;
        }

        .demo-card {
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.86));
          border: 1px solid rgba(148, 163, 184, 0.4);
          padding: 1rem 1.1rem 1.05rem;
          font-size: 0.82rem;
        }

        .demo-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.55rem;
          font-size: 0.8rem;
          color: var(--text-soft);
          gap: 0.6rem;
        }

        .demo-card-header strong {
          font-size: 0.88rem;
          color: #e5e7eb;
        }

        .tag {
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .zmanim-table {
          display: grid;
          grid-template-columns: 1.15fr 0.9fr 0.9fr;
          gap: 0.26rem 0.6rem;
          margin-top: 0.1rem;
          align-items: center;
        }

        .zman-label {
          color: var(--text-soft);
        }

        .zman-time {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .zman-note {
          font-size: 0.72rem;
          text-align: right;
          color: #9ca3af;
        }

        .parasha {
          margin-top: 0.7rem;
          padding-top: 0.7rem;
          border-top: 1px dashed rgba(148, 163, 184, 0.45);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.78rem;
          flex-wrap: wrap;
        }

        .parasha-title {
          font-weight: 600;
        }

        .parasha-ref {
          color: #a5b4fc;
          font-size: 0.74rem;
        }

        .demo-note {
          margin-top: 0.6rem;
          font-size: 0.74rem;
          color: #9ca3af;
          line-height: 1.5;
        }

        .weather-days {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.4rem;
          margin-top: 0.35rem;
        }

        .weather-day {
          border-radius: 13px;
          padding: 0.42rem 0.45rem;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.5);
          text-align: center;
          font-size: 0.74rem;
        }

        .weather-day span {
          display: block;
        }

        .weather-day .w-label {
          color: #e5e7eb;
          font-weight: 500;
          margin-bottom: 0.1rem;
        }

        .weather-day .w-icon {
          font-size: 1.1rem;
          margin-bottom: 0.08rem;
        }

        .weather-day .w-temp {
          font-variant-numeric: tabular-nums;
          color: #bae6fd;
        }

        .weather-day .w-low {
          font-size: 0.68rem;
          color: #9ca3af;
        }

        .shul-schedule {
          margin-top: 0.55rem;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr 0.9fr;
          gap: 0.26rem 0.65rem;
          font-size: 0.8rem;
        }

        .shul-schedule .label {
          color: var(--text-soft);
        }

        .shul-schedule .time {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .shul-schedule .room {
          text-align: right;
          color: #9ca3af;
          font-size: 0.72rem;
        }

        .shul-photo {
          margin-top: 0.65rem;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: linear-gradient(135deg, #111827, #020617);
          padding: 0.65rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
        }

        .shul-photo-thumb {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: radial-gradient(circle at 20% 20%, #e5e7eb, #9ca3af 35%, #020617 100%);
          box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.45);
          flex-shrink: 0;
        }

        .shul-photo-text strong {
          display: block;
          font-size: 0.82rem;
        }

        .shul-photo-text span {
          color: #9ca3af;
          font-size: 0.74rem;
        }

        .emergency-banner {
          position: absolute;
          left: 1.2rem;
          right: 1.2rem;
          bottom: 1.05rem;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            rgba(248, 113, 113, 0.98),
            rgba(248, 113, 113, 0.75)
          );
          color: #111827;
          padding: 0.55rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
          box-shadow: 0 16px 34px rgba(127, 29, 29, 0.7);
          font-size: 0.82rem;
        }

        .emergency-icon {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: rgba(248, 250, 252, 0.08);
          border: 1px solid rgba(248, 250, 252, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .emergency-text strong {
          font-weight: 700;
        }

        .emergency-text span {
          font-weight: 500;
        }

        .emergency-pill {
          margin-left: auto;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          padding: 0.14rem 0.6rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.9);
          color: #fecaca;
          border: 1px solid rgba(15, 23, 42, 0.95);
          white-space: nowrap;
        }

        section {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .section {
          padding: 3rem 0 3.5rem;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.9rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.45rem;
        }

        .section-header p {
          margin: 0;
          color: var(--text-soft);
          font-size: 0.95rem;
          max-width: 42rem;
          line-height: 1.7;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          padding: 1.1rem 1.15rem 1.15rem;
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-height: 180px;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          margin-bottom: 0.5rem;
          font-size: 1.15rem;
        }

        .feature-card h3 {
          margin: 0 0 0.3rem;
          font-size: 0.98rem;
        }

        .feature-card p {
          margin: 0;
          color: var(--text-soft);
          line-height: 1.6;
        }

        .feature-tagline {
          margin-top: 0.5rem;
          font-size: 0.78rem;
          color: #9ca3af;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
          font-size: 0.9rem;
        }

        .step-card {
          border-radius: var(--radius-lg);
          border: 1px dashed rgba(148, 163, 184, 0.8);
          background: var(--bg-soft);
          padding: 1.1rem 1.2rem;
          min-height: 160px;
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

        @media (max-width: 1100px) {
          .hero {
            grid-template-columns: minmax(0, 1fr);
            gap: 2.2rem;
            padding: 2.7rem 1.25rem 2.9rem;
          }
          .demo-panel {
            order: -1;
          }
          .nav-links {
            display: none;
          }
        }

        @media (max-width: 720px) {
          .nav-cta {
            justify-content: flex-start;
          }
          header {
            position: static;
          }
          .demo-grid {
            grid-template-columns: 1fr;
          }
          .hero-actions {
            gap: 0.75rem;
          }
          .demo-panel {
            padding-bottom: 3.4rem;
          }
          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 540px) {
          .feature-grid {
            grid-template-columns: 1fr;
          }
          .steps {
            grid-template-columns: 1fr;
          }
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
          transition: border 0.12s ease, box-shadow 0.12s ease, background 0.12s ease,
            transform 0.06s ease;
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
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        footer {
          border-top: 1px solid rgba(148, 163, 184, 0.28);
          margin-top: 2.4rem;
          padding: 1.1rem 1.5rem 1.6rem;
          font-size: 0.8rem;
          color: #9ca3af;
          text-align: center;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.98),
            rgba(15, 23, 42, 0.78)
          );
        }

        .footer-inner {
          max-width: var(--max-width);
          margin: 0 auto;
          display: grid;
          gap: 0.65rem;
          line-height: 1.6;
        }

        .footer-disclaimer {
          font-size: 0.78rem;
          color: #a9b3c9;
          line-height: 1.6;
        }
      `}</style>

      <header>
        <div className="nav-inner">
          <a href="#" className="logo">
            <div className="logo-mark">ZT</div>
            <span>zmanim.tv</span>
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#contact">Book a demo</a>
            <a href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00" target="_blank" rel="noopener">
              Donate
            </a>
          </nav>
          <div className="nav-cta">
            <span className="pill">Built for synagogues</span>
            <span className="pill-neutral">Beta · Complimentary for early adopters</span>
            <a
              href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00"
              target="_blank"
              rel="noopener"
              className="btn-secondary-outline"
            >
              Support development
            </a>
            <button className="btn-primary">
              Request a demo <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="hero-eyebrow">Hebrew calendar digital signage</div>
            <h1>
              Live <span className="highlight">zmanim, Hebrew dates, and alerts</span>
              <br />
              on every screen in your shul.
            </h1>
            <p className="hero-subtitle">
              zmanim.tv powers a dedicated display for your synagogue with real-time prayer times,
              full Hebrew calendar, 5-day forecast, parasha of the week, shul schedule, and
              emergency alerts - managed from a simple web console.
            </p>

            <div className="hero-badges">
              <span>
                <strong>Hebrew calendar-aware</strong> · parasha, moadim, yomim tovim
              </span>
              <span>
                Auto-updated <strong>zmanim &amp; minyan times</strong>
              </span>
              <span>
                <strong>Emergency overlay</strong> for security / weather notices
              </span>
            </div>

            <div className="hero-actions">
              <button className="btn-primary">
                Get early-access pricing <span aria-hidden>→</span>
              </button>
              <a href="#demo" className="secondary-link">
                See the live board layout <span aria-hidden>→</span>
              </a>
            </div>

            <div className="trust-text">
              Inspired by leading synagogue display systems, reimagined as a modern, browser-based
              platform you can run on <strong>any computer + TV</strong>.
            </div>

            <div className="beta-note-hero">
              <strong>Early-access program:</strong> we are currently operating in a controlled
              beta. Approved synagogues receive <span>complimentary usage for the foreseeable future</span>{" "}
              while we refine and harden the platform.
            </div>
          </div>

          <div id="demo" className="demo-panel">
            <div className="demo-header">
              <div className="demo-header-left">
                <div className="demo-title">Main Shul Lobby Display</div>
                <div className="demo-location">Beth Torah Synagogue - Los Angeles, CA</div>
              </div>
              <div className="demo-header-right">
                <div className="demo-time">{clockTime.toUpperCase()}</div>
                <div className="demo-date">{demoDateText}</div>
              </div>
            </div>

            <div className="demo-grid">
              <div className="demo-card">
                <div className="demo-card-header">
                  <strong>Yom Kippur Zmanim &amp; Readings</strong>
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
                  <div className="zman-note" />

                  <div className="zman-label">Yizkor</div>
                  <div className="zman-time">11:15 AM</div>
                  <div className="zman-note" />
                </div>

                <div className="parasha">
                  <div>
                    <div className="parasha-title">Yom Kippur Readings</div>
                    <div className="parasha-ref">Leviticus 16, Numbers 29; Jonah (Mincha)</div>
                  </div>
                  <div>
                    <div className="parasha-ref">Shacharit: 8:30 AM</div>
                    <div className="parasha-ref">Ne'ilah &amp; shofar: ~7:10 PM</div>
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
                    <div key={day.label} className="weather-day">
                      <span className="w-label">{day.label}</span>
                      <span className="w-icon">{day.icon}</span>
                      <span className="w-temp">{day.temp}</span>
                      <span className="w-low">{day.low}</span>
                    </div>
                  ))}
                </div>

                <div className="shul-schedule">
                  {schedule.map((item) => (
                    <div key={item.label} className="shul-schedule-row">
                      <div className="label">{item.label}</div>
                      <div className="time">{item.time}</div>
                      <div className="room">{item.room}</div>
                    </div>
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
                <strong>Security advisory (demo).</strong>
                <span>
                  {" "}
                  Please keep all exterior doors closed during Yom Kippur services. Follow
                  instructions from security personnel.
                </span>
              </div>
              <div className="emergency-pill">On-screen override</div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div className="section-header">
            <h2>Everything your shul's digital board needs - in one system.</h2>
            <p>
              zmanim.tv takes the best ideas from existing synagogue displays (dynamic zmanim, prayer
              schedules, announcements, and Hebrew dates) and wraps them in a clean, modern layout
              that runs in any browser.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🕒</div>
              <h3>Live time, date &amp; full Hebrew calendar</h3>
              <p>
                Always-on display with current time, Gregorian date, Hebrew date, upcoming chagim,
                Rosh Chodesh, and special days - no more manual luach updates.
              </p>
              <div className="feature-tagline">
                Automatically adjusts for your time zone and daylight savings.
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📜</div>
              <h3>Zmanim &amp; parasha of the week</h3>
              <p>
                Accurate halachic times (alot, neitz, shema, tefilla, chatzot, shkiah, Rabbeinu Tam,
                and more) with parasha, candle lighting / havdalah times, and High Holy Day
                schedules.
              </p>
              <div className="feature-tagline">Location-aware, customizable per minhag.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">☁️</div>
              <h3>5-day local weather forecast</h3>
              <p>
                Integrated 5-day forecast card for your shul's city, including highs, lows, and
                simple icon summary, so people know what to expect before they step outside.
              </p>
              <div className="feature-tagline">Pulled from a reliable weather API - refreshed automatically.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🕍</div>
              <h3>Shul schedule &amp; shiurim</h3>
              <p>
                Show daily minyan times, room assignments, daf yomi and shiur schedules - all in one
                clean schedule panel tuned for quick reading from across the room.
              </p>
              <div className="feature-tagline">Manage from a browser; push changes instantly.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h3>Rotating photos &amp; dedications</h3>
              <p>
                Add sponsor slides, dedication plaques, and community photos. The system cycles
                through them between minyanim or in a dedicated "at rest" layout.
              </p>
              <div className="feature-tagline">Ideal for fundraising campaigns and donor walls.</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Emergency alert overlay</h3>
              <p>
                When something urgent happens - security, weather, safety - trigger an on-screen
                banner or full-screen overlay that immediately overrides the normal layout.
              </p>
              <div className="feature-tagline">Single-click alerts; visible on every connected screen.</div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section">
          <div className="section-header">
            <h2>How zmanim.tv fits into your existing setup.</h2>
            <p>
              No proprietary hardware required. Run the display on a small PC, mini-computer, or media
              stick behind any HDMI screen. Manage everything from a password-protected web console.
            </p>
          </div>

          <div className="steps">
            <div className="step-card">
              <div className="step-number">Step 1</div>
              <h3>Connect any computer + TV</h3>
              <p>
                Plug a mini PC, NUC, or thin client into your lobby TV, open the zmanim.tv display URL
                in a browser, and set it to auto-launch on boot.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">Step 2</div>
              <h3>Configure your shul profile</h3>
              <p>
                Choose your location, nusach, minyan schedule, and branding (logo, background, colors).
                The system will calculate zmanim and Hebrew dates automatically.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">Step 3</div>
              <h3>Manage content from anywhere</h3>
              <p>
                Use the admin console to update schedules, upload images, and trigger emergency alerts
                in real time - without touching the screen in shul.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="section-header">
            <h2>Get early-access pricing for your shul.</h2>
            <p>
              Share a few details below and we'll follow up with a short call, a live demo of the board,
              and a proposal tailored to your synagogue's needs.
            </p>
          </div>

          <div className="contact-grid">
            <form>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" type="text" placeholder="Contact person (e.g. Gabbai / Board member)" />
                </div>
                <div className="form-field">
                  <label htmlFor="rabbi">Rabbi's name</label>
                  <input id="rabbi" name="rabbi" type="text" placeholder="e.g. Rabbi Cohen" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="you@example.org" />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone number</label>
                  <input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="shul">Shul / organization</label>
                  <input id="shul" name="shul" type="text" placeholder="Beth Torah Synagogue" />
                </div>
                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" type="text" placeholder="City, Country" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="role">Your role</label>
                  <input id="role" name="role" type="text" placeholder="Rabbi, Executive Director, Gabbai, etc." />
                </div>
                <div className="form-field">
                  <label htmlFor="timeline">When do you want to start?</label>
                  <select id="timeline" name="timeline">
                    <option value="">Select a timeline</option>
                    <option>Within 30 days</option>
                    <option>1-3 months</option>
                    <option>3-6 months</option>
                    <option>Just exploring options</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="message">What would you like your board to show?</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Zmanim, minyan schedule, emergency alerts, dedications, etc."
                />
                <div className="form-helper">
                  Example: "Lobby board with daily zmanim, Yom Kippur / High Holy Day schedules, emergency alert
                  strip, and a rotation of sponsor slides."
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Submit inquiry <span aria-hidden>→</span>
              </button>
            </form>

            <div className="contact-note">
              <p>With zmanim.tv you get a focused solution built specifically for Jewish institutions:</p>
              <ul>
                <li>Full Hebrew calendar and parasha support, tuned for synagogue use.</li>
                <li>Dynamic zmanim and minyan schedules, including High Holy Day layouts.</li>
                <li>Runs in any modern browser - no proprietary player hardware required.</li>
                <li>Room for future modules: yahrzeit displays, donor walls, and more.</li>
                <li>Complimentary usage during the beta period for approved pilot sites.</li>
              </ul>
              <div className="donation-link">
                To support ongoing development of zmanim.tv, you may make a donation via Stripe:{" "}
                <a href="https://buy.stripe.com/00wdR89py6qMdtMeMX5os00" target="_blank" rel="noopener">
                  https://buy.stripe.com/00wdR89py6qMdtMeMX5os00
                </a>
                .
              </div>
              <div className="beta-disclaimer-inline">
                <strong>Beta testing notice:</strong> zmanim.tv is currently operating as a beta service.
                Functionality may change and defects may occur; the platform should not be treated as a sole source
                for safety-critical or time-critical decisions.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-inner">
          <div>© 2025 zmanim.tv · Hebrew calendar digital signage for synagogues & Jewish institutions.</div>
          <div>Simple browser-based deployment · Designed to run on any computer that can open a modern web browser.</div>
          <div className="footer-disclaimer">
            <strong>Beta testing disclaimer:</strong> zmanim.tv is currently in beta testing and may contain bugs,
            defects, or inaccuracies. The service, including all displayed times, dates, alerts, and content, is
            provided on an “as-is” and “as-available” basis without any warranties or guarantees of accuracy,
            availability, or fitness for a particular purpose. By accessing or using the service, you acknowledge and
            agree that we do not accept any responsibility or liability for errors, outages, misconfigurations, or any
            direct or indirect loss, damage, or consequence arising from reliance on the information shown on the
            displays.
          </div>
        </div>
      </footer>
    </div>
  );
}
