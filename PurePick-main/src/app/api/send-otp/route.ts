import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db-connect";
import Otp from "@/models/otp-model";

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
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Your PurePick Verification Code",
      html: `<h2>Your OTP is: ${otp}</h2>`
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
