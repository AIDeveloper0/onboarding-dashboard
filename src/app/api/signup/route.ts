import crypto from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type SignupPayload = {
  email?: string;
  phone?: string | null;
  fullName?: string;
  company?: string | null;
  website?: string | null;
  services?: string | null;
};

type MagicLinkRecord = {
  token: string;
  purpose: string;
  expires_at: string;
  email: string;
  metadata: Record<string, unknown>;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

function createToken(): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(); // 3 days
  return { token, expiresAt };
}

function buildMagicLinkEmail(links: string[]) {
  const safeLinks = links.slice(0, 2);

  const textLines = [
    "Hi there,",
    "",
    "Your dashboard is ready. Use the magic links below (they expire in 3 days):",
    ...safeLinks.map((link, idx) => `${idx + 1}. ${link}`),
    "",
    "If you didn't request this, you can ignore this email.",
  ];

  const buttons = safeLinks
    .map(
      (link, idx) => `
        <tr>
          <td align="center" style="padding: 10px 0;">
            <a href="${link}" style="
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #22d3ee);
              color: #0b172a;
              text-decoration: none;
              font-weight: 600;
              padding: 12px 18px;
              border-radius: 999px;
              font-size: 15px;
              font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            ">
              Open Dashboard (Link ${idx + 1})
            </a>
          </td>
        </tr>`
    )
    .join("");

  const html = `
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b172a;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="520" style="background:#0f2136;border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 30px 80px -40px rgba(0,0,0,0.7);">
          <tr>
            <td style="text-align:center;padding-bottom:12px;">
              <div style="font-size:12px;letter-spacing:0.2em;color:#34d399;text-transform:uppercase;font-weight:700;">Onboarding</div>
              <div style="color:#e5e7eb;font-size:22px;font-weight:700;margin-top:6px;">Access your dashboard</div>
            </td>
          </tr>
          <tr>
            <td style="color:#cbd5e1;font-size:15px;line-height:1.6;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;padding-top:6px;padding-bottom:14px;">
              Hi there,<br/><br/>
              Your dashboard is ready. Use the magic links below (they expire in 3 days):
            </td>
          </tr>
          ${buttons}
          <tr>
            <td style="padding-top:12px;color:#94a3b8;font-size:13px;line-height:1.6;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;">
              If you didn’t request this, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  return { text: textLines.join("\n"), html };
}

async function sendMagicLinkEmail(to: string, links: string[]) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return {
      sent: false,
      reason: "SMTP configuration missing; magic links returned in response for debugging.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const { text, html } = buildMagicLinkEmail(links);

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Your dashboard magic links",
    text,
    html,
  });

  return { sent: true as const };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() || null;
    const fullName = body.fullName?.trim() ?? "";
    const company = body.company?.trim() || null;
    const website = body.website?.trim() || null;
    const services = body.services?.trim() || null;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 },
      );
    }

    const { data: existingUser, error: fetchError } = await supabaseServer
      .from("users_custom")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: "Could not check user existence." },
        { status: 500 },
      );
    }

    let userId = existingUser?.id as string | undefined;

    if (!existingUser) {
      const { data: inserted, error: insertError } = await supabaseServer
        .from("users_custom")
        .insert([
          {
            email,
            phone,
            full_name: fullName,
            q1: company,
            q2: website,
            q3: services,
            latitude: null,
            longitude: null,
            elevation: null,
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        const duplicate =
          insertError.message?.includes("users_custom_email_key") ||
          insertError.code === "23505";

        return NextResponse.json(
          {
            error: duplicate
              ? "This email is already registered. Please use a different email or go to your dashboard."
              : "Could not create profile.",
          },
          { status: duplicate ? 409 : 500 },
        );
      }

      userId = inserted?.id as string;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Profile creation failed. Please try again." },
        { status: 500 },
      );
    }

    const tokenA = createToken();
    const tokenB = createToken();

    const linkA = `${appBaseUrl}/dashboard?token=${encodeURIComponent(tokenA.token)}`;
    const linkB = `${appBaseUrl}/dashboard?token=${encodeURIComponent(tokenB.token)}`;

    const records: MagicLinkRecord[] = [
      {
        email,
        token: tokenA.token,
        purpose: "dashboard_primary",
        expires_at: tokenA.expiresAt,
        metadata: { user_id: userId },
      },
      {
        email,
        token: tokenB.token,
        purpose: "dashboard_secondary",
        expires_at: tokenB.expiresAt,
        metadata: { user_id: userId },
      },
    ];

    const { error: linkInsertError } = await supabaseServer
      .from("magic_links")
      .insert(records);

    if (linkInsertError) {
      return NextResponse.json(
        { error: "Could not create magic links." },
        { status: 500 },
      );
    }

    const emailResult = await sendMagicLinkEmail(email, [linkA, linkB]).catch(
      (error) => {
        console.error("Failed sending magic link email", error);
        return { sent: false, reason: "Email send failed." };
      },
    );

    return NextResponse.json({
      message: emailResult.sent
        ? "Signup complete. Check your email for magic links."
        : "Signup complete. Email not sent; use the links returned below.",
      links: emailResult.sent ? undefined : [linkA, linkB],
      info: emailResult.sent ? undefined : emailResult.reason,
    });
  } catch (error) {
    console.error("Signup API error", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 },
    );
  }
}
