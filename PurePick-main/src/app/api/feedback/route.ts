import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const mailFrom = `"NutriLens" <${process.env.NODEMAILER_EMAIL}>`;

export async function POST(req: Request) {
    try {
        const { type, subject, message, rating, email } = await req.json();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        const stars = "★".repeat(Number(rating) || 0);
        const feedbackSubject = subject || type || "Feedback";

        const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6ebf2;box-shadow:0 12px 32px rgba(23,32,51,0.08);">
                  <tr>
                    <td style="padding:28px 30px;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#ffffff;">
                      <div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;opacity:0.9;">NutriLens</div>
                      <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">New feedback received</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <p style="margin:0 0 18px;color:#667085;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Feedback details</p>
                      <div style="display:grid;gap:14px;">
                        <p style="margin:0;"><span style="color:#667085;font-size:13px;">Type</span><br><strong>${type}</strong></p>
                        <p style="margin:0;"><span style="color:#667085;font-size:13px;">Subject</span><br><strong>${feedbackSubject}</strong></p>
                        <p style="margin:0;"><span style="color:#667085;font-size:13px;">Rating</span><br><strong style="font-size:22px;color:#f59e0b;">${stars}</strong></p>
                      </div>
                      <div style="margin-top:22px;padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #edf1f7;line-height:1.6;">
                        ${message}
                      </div>
                      <div style="margin-top:22px;padding:16px;border-radius:12px;background:#f1f5ff;border:1px solid #dce6ff;">
                        <span style="color:#667085;font-size:13px;">User email</span><br>
                        <strong>${email || "Not provided"}</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

        await transporter.sendMail({
            from: mailFrom,
            to: "asatianmol78@gmail.com",
            subject: `New NutriLens feedback: ${feedbackSubject}`,
            html: emailHtml,
        });

        if (email) {
            await transporter.sendMail({
                from: mailFrom,
                to: email,
                subject: "Thank you for your feedback - NutriLens",
                html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6ebf2;box-shadow:0 12px 32px rgba(23,32,51,0.08);">
                      <tr>
                        <td style="padding:28px 30px;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#ffffff;">
                          <div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;opacity:0.9;">NutriLens</div>
                          <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">Thank you for your feedback</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px 30px;line-height:1.7;">
                          <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:#ecfeff;color:#0e7490;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Feedback received</span>
                          <p>We appreciate you taking the time to share your thoughts with us.</p>
                          <p>Your feedback helps us improve NutriLens and make product insights more useful for everyone.</p>
                          <p style="margin-bottom:0;">Best regards,<br><strong>The NutriLens Team</strong></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
    }
}
