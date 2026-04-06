import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        // Notify admin
        await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: 'asatianmol78@gmail.com',
            subject: 'New Newsletter Subscriber',
            html: `<p>New subscriber: <strong>${email}</strong></p>`
        });

        // Confirm to user
        await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: 'Welcome to PurePick Newsletter!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(to right, #7928CA, #FF0080); padding: 20px; border-radius: 10px; color: white; margin-bottom: 20px;">
                        <h1>You're subscribed! 🎉</h1>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <p>Thanks for subscribing to the PurePick newsletter.</p>
                        <p>You'll now receive the latest articles on food safety, ingredients, and health directly in your inbox.</p>
                        <p>Best regards,<br>The PurePick Team</p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}