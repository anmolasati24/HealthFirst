import connectDB from "@/lib/db-connect";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "MongoDB connected successfully" });
}
