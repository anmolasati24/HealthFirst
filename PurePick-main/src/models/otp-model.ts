import mongoose, { Schema, Document } from "mongoose";

interface IOtp extends Document {
  email: string;
  otp: string;
  type: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Otp =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
