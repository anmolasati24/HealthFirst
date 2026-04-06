import { OtpType } from "@/types/otp.types";

// =========================
// Verify OTP (calls Next.js API directly)
// =========================
export const verifyOtp = async (
  email: string,
  otp: string,
  type: OtpType
): Promise<{ reason: string; isVerified: boolean }> => {

  try {
    const result = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, type }),
    });

    const data = await result.json();

    if (!result.ok) {
      return { reason: data.error || "Verification failed", isVerified: false };
    }

    return { reason: "", isVerified: true };

  } catch (error) {
    console.error("verifyOtp error:", error);
    return { reason: "Verification failed", isVerified: false };
  }
};
