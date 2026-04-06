import express from "express";
import NodeCache from "node-cache";
import bcrypt from "bcryptjs";
import * as otplib from "otplib";

const { authenticator } = otplib;

const router = express.Router();

// Store OTP temporarily (5 min expiry)
const otpCache = new NodeCache({ stdTTL: 300 });

// =========================
// SEND OTP
// =========================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate OTP
    const otp = authenticator.generate("PUREPICK_SECRET");

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Save in cache
    otpCache.set(email, {
      otp: hashedOTP,
      createdAt: Date.now(),
    });

    // 🔥 For now (FREE setup) → show OTP in console
    console.log(`📩 OTP for ${email}:`, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("❌ Send OTP Error:", error.message);

    return res.status(500).json({
      error: "Failed to send OTP",
    });
  }
});

// =========================
// VERIFY OTP
// =========================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const data = otpCache.get(email);

    if (!data) {
      return res.status(400).json({
        error: "OTP expired or not found",
      });
    }

    const isMatch = await bcrypt.compare(otp, data.otp);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // ✅ Remove OTP after success
    otpCache.del(email);

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log("❌ Verify OTP Error:", error.message);

    return res.status(500).json({
      error: "OTP verification failed",
    });
  }
});

export default router;