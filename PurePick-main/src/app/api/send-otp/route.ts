import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db-connect";
import Otp from "@/models/otp-model";

const mailFrom = `"NutriLens" <${process.env.NODEMAILER_EMAIL}>`;

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    await connectDB();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: email,
      subject: "Your NutriLens verification code",
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
                        <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">Verify your email</h1>
                        <p style="margin:10px 0 0;font-size:15px;line-height:1.6;opacity:0.92;">Use this code to complete your signup securely.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:34px 30px;text-align:center;">
                        <p style="margin:0 0 14px;font-size:14px;color:#667085;">Your verification code</p>
                        <div style="display:inline-block;padding:16px 24px;border-radius:14px;background:#f1f5ff;border:1px solid #dce6ff;font-size:34px;font-weight:800;letter-spacing:0.18em;color:#3730a3;">
                          ${otp}
                        </div>
                        <p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#667085;">This code expires in 5 minutes. If you did not request it, you can safely ignore this email.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 30px;background:#f8fafc;text-align:center;color:#98a2b3;font-size:12px;">
                        NutriLens helps you understand products before you use them.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    });

    const hashedOTP = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
      { email, type },
      {
        otp: hashedOTP,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
