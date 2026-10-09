import nodemailer from "nodemailer";
import { httpError } from "../utils/http.js";
export function escapeHtml(text) { return String(text).replace(/[&<>"']/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[value])); }
export function emailTemplate(subject, text) {
    return `<!doctype html><html lang="hy"><body style="margin:0;background:#f4f4f1;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px"><tr><td style="padding:28px 32px;background:#202020;color:#e2bd50;font-size:26px;font-weight:bold;border-radius:16px 16px 0 0">ArmMotors</td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 22px;color:#202020;font-size:25px;line-height:1.4">${escapeHtml(subject)}</h1><div style="color:#555;font-size:16px;line-height:1.8">${escapeHtml(text).replace(/\n/g, "<br>")}</div></td></tr><tr><td style="padding:22px 32px;border-top:1px solid #eee;color:#888;font-size:12px">Այս նամակն ուղարկվել է Ձեր ArmMotors հաշվի email-ին։ Հարցերի դեպքում պատասխանեք այս նամակին։</td></tr></table></td></tr></table></body></html>`;
}
export function mailConfigured() { return process.env.NODE_ENV === "test" || Boolean((process.env.SMTP_HOST || process.env.EMAIL_USER) && (process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS)); }
export function createMailTransport() {
    if (process.env.NODE_ENV === "test") return nodemailer.createTransport({ jsonTransport: true });
    if (!mailConfigured()) throw httpError(503, "Լրացրեք SMTP տվյալները backend/.env-ում։");
    return nodemailer.createTransport({
        ...(process.env.SMTP_HOST ? { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true" } : { service: "gmail" }),
        auth: { user: process.env.SMTP_USER || process.env.EMAIL_USER, pass: process.env.SMTP_PASS || process.env.EMAIL_PASS },
        connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000
    });
}
export async function sendBroadcastEmail(delivery, broadcast) {
    const transport = createMailTransport();
    try { return await transport.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || "ArmMotors <test@example.com>", to: delivery.email,
        subject: broadcast.subject, text: broadcast.text, html: emailTemplate(broadcast.subject, broadcast.text),
        messageId: `<${delivery._id}@armmotors.local>` }); }
    finally { transport.close(); }
}
