import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db-connect";
import Otp from "@/models/otp-model";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, type } = await req.json();

    await connectDB();

    const record = await Otp.findOne({ email, type });

    if (!record) {
      return NextResponse.json({ error: "OTP not found" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await Otp.deleteOne({ email, type });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
