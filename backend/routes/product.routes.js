import express from "express";
import { processData } from "../utils/process-data.js";

const router = express.Router();

// =========================
// PRODUCT ANALYSIS
// =========================
router.post("/analyze", async (req, res) => {
  try {
    const { images, userId } = req.body;

    // Validation
    if (!images || images.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide 2 product images",
      });
    }

    // Call main pipeline
    const result = await processData(images, null, userId);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Product processing failed",
      });
    }

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.log("❌ Product Route Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;