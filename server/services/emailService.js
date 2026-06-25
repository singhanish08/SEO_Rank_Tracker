import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "RankPilot <onboarding@resend.dev>";

const baseStyles = `
    body { margin: 0; padding: 0; background-color: #09090b; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo svg { vertical-align: middle; }
    .logo span { font-size: 22px; font-weight: 600; color: #f9fafb; margin-left: 8px; }
    .card { background: #121214; border: 1px solid #27272a; border-radius: 16px; padding: 40px 32px; }
    .card h1 { font-size: 22px; font-weight: 600; color: #f9fafb; margin: 0 0 8px 0; text-align: center; }
    .card p { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; text-align: center; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; }
    .btn-primary { background-color: #f9fafb; color: #09090b; }
    .btn-wrapper { text-align: center; margin: 28px 0; }
    .fallback { text-align: center; margin-top: 20px; }
    .fallback p { font-size: 12px; color: #6b7280; margin: 0 0 4px 0; }
    .fallback a { font-size: 12px; color: #3b82f6; word-break: break-all; }
    .note { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #27272a; }
    .note p { font-size: 12px; color: #6b7280; margin: 0; }
    .footer { text-align: center; margin-top: 24px; }
    .footer p { font-size: 12px; color: #52525b; margin: 0; }
`;

export async function sendVerificationEmail(to, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: "Verify your email — RankPilot",
            html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}</style></head>
<body>
<div class="container">
    <div class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f9fafb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/></svg>
        <span>RankPilot</span>
    </div>
    <div class="card">
        <h1>Verify your email</h1>
        <p>Hi ${name},<br><br>Thanks for signing up! Click the button below to verify your email address and activate your account.</p>
        <div class="btn-wrapper">
            <a href="${verificationUrl}" class="btn btn-primary">Verify Email</a>
        </div>
        <div class="fallback">
            <p>Or copy and paste this link:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
        </div>
        <div class="note">
            <p>This link expires in 30 minutes. If you didn't create an account, you can ignore this email.</p>
        </div>
    </div>
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RankPilot. All rights reserved.</p>
    </div>
</div>
</body>
</html>`,
        });
    } catch (error) {
        console.error("[EMAIL] Verification email failed:", error.message);
    }
}

export async function sendPasswordResetEmail(to, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: "Reset your password — RankPilot",
            html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}</style></head>
<body>
<div class="container">
    <div class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f9fafb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/></svg>
        <span>RankPilot</span>
    </div>
    <div class="card">
        <h1>Reset your password</h1>
        <p>Hi ${name},<br><br>We received a request to reset your password. Click the button below to set a new password.</p>
        <div class="btn-wrapper">
            <a href="${resetUrl}" class="btn btn-primary">Reset Password</a>
        </div>
        <div class="fallback">
            <p>Or copy and paste this link:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        </div>
        <div class="note">
            <p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
    </div>
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} RankPilot. All rights reserved.</p>
    </div>
</div>
</body>
</html>`,
        });
    } catch (error) {
        console.error("[EMAIL] Password reset email failed:", error.message);
    }
}
