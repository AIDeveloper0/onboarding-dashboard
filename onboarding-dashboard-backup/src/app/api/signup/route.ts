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

  const textLines = [
    "Hi,",
    "",
    "Here are your dashboard magic links:",
    ...links.map((link, idx) => `${idx + 1}. ${link}`),
    "",
    "They expire in 3 days.",
  ];

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Your dashboard magic links",
    text: textLines.join("\n"),
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
