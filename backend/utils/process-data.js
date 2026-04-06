import { getUpcOrEan } from "./get-upc-ean.js";
import { fetchBarcodeInfo } from "../api/fetch-barcode-info.js";
import { getProductDetails, getProductDetailsByName } from "./get-product-details.js";
import { extractAndFormatData } from "../services/ai/extract-and-format-data.js";
import { analyzeProductImages } from "../services/ai/ai-analysis.js";
import getAlternateProductDetails from "./get-alternate-product-details.js";
import { extractDates } from "./extract-dates.js";
import { uploadImages } from "../services/storage/upload-images.js";
import { prepareProductInsight } from "./prepare-product-insight.js";
import { ProductInsight } from "../models/product-insight.js";
import { getUserDetails } from "./get-user-details.js";

// ─────────────────────────────────────────────
// Helper: Parse OFF ingredients_text
// ─────────────────────────────────────────────
const parseIngredientsText = (text) => {
  if (!text || typeof text !== "string") return [];
  return text
    .split(/,(?![^()]*\))/)
    .map((ing) => ing.trim())
    .filter((ing) => ing.length > 0)
    .map((ing) => {
      const eMatch = ing.match(/E\d{3,4}/i);
      const nameInBrackets = ing.match(/\(([^)]+)\)/);
      return {
        name:           ing.replace(/\(.*?\)/g, "").trim(),
        simplifiedName: nameInBrackets?.[1] || ing.replace(/\(.*?\)/g, "").trim(),
        quantity:       "Unknown",
        purpose:        eMatch ? `Additive ${eMatch[0]}` : "Unknown",
      };
    });
};

// ─────────────────────────────────────────────
// Helper: Parse OFF ingredients array
// ─────────────────────────────────────────────
const parseIngredientsArray = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return [];
  return ingredients.map((ing) => ({
    name:           ing.text || ing.id || "Unknown",
    simplifiedName: ing.text || ing.id || "Unknown",
    quantity:       ing.percent_estimate
      ? `${Math.round(ing.percent_estimate)}%`
      : "Unknown",
    purpose: "Unknown",
  }));
};

const processData = async (data, socket, userId) => {
  try {
    console.log("🚀 processData started");
    console.log("👤 userId:", userId);
    console.log("🖼️ images count:", data?.length);

    // ─────────────────────────────────────────────
    // GUARDS
    // ─────────────────────────────────────────────
    if (!data || !Array.isArray(data) || data.length < 2) {
      return socket.emit("process-error", { message: "Invalid image data received" });
    }
    if (!data[0]?.file || !data[1]?.file) {
      return socket.emit("process-error", { message: "Image file data is missing" });
    }
    if (!userId) {
      return socket.emit("process-error", { message: "User ID is missing" });
    }

    // ─────────────────────────────────────────────
    // 1. IMAGE BUFFER
    // ─────────────────────────────────────────────
    console.log("📸 Step 1: Creating buffers...");
    const buffer1 = Buffer.from(data[0].file, "base64");
    const buffer2 = Buffer.from(data[1].file, "base64");
    console.log("✅ Buffers created");
    socket.emit("image-upload", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 2. BARCODE
    // ─────────────────────────────────────────────
    console.log("🔍 Step 2: Getting barcode...");
    let barcode =
      getUpcOrEan(data[0].barcodeInfo) ||
      getUpcOrEan(data[1].barcodeInfo);

    if (!barcode) {
      const [info2, info1] = await Promise.all([
        fetchBarcodeInfo(buffer2),
        fetchBarcodeInfo(buffer1),
      ]);
      barcode = getUpcOrEan(info2) || getUpcOrEan(info1);
    }
    console.log("✅ Barcode from scan:", barcode);
    socket.emit("product-scanning", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 3. USER + PRODUCT DATA IN PARALLEL
    // ─────────────────────────────────────────────
    console.log("👤 Step 3: Fetching user + product data...");
    const [userDetails, productAdditionalInfo] = await Promise.all([
      getUserDetails(userId),
      getProductDetails(barcode),
    ]);
    console.log("✅ userDetails:", !!userDetails);
    console.log("✅ foodData from barcode:", !!productAdditionalInfo?.foodData);
    socket.emit("product-info-search", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 4. AI ANALYSIS
    // ─────────────────────────────────────────────
    console.log("🤖 Step 4: AI analysis...");
    const aiRaw = await analyzeProductImages(
      [{ file: data[0].file }, { file: data[1].file }],
      userDetails
    );

    if (!aiRaw) {
      socket.emit("extraction", { isSuccess: false, message: "AI analysis failed" });
      return;
    }

    socket.emit("extraction", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 4.5 ✅ USE AI BARCODE IF SCAN FAILED
    // ─────────────────────────────────────────────
    if (!barcode) {
      const aiBarcode = aiRaw?.productDetails?.barcode;
      if (aiBarcode && aiBarcode !== "Unknown" && aiBarcode !== "") {
        barcode = aiBarcode;
        console.log("✅ Using AI-extracted barcode:", barcode);

        // ✅ Fetch OFF with AI barcode if we don't have food data yet
        if (!productAdditionalInfo?.foodData) {
          console.log("🔄 Fetching OFF with AI barcode...");
          const freshData = await getProductDetails(barcode);
          if (freshData?.foodData) {
            productAdditionalInfo.foodData = freshData.foodData;
            console.log("✅ Got OFF data with AI barcode!");
          }
        }
      }
    }

    // ─────────────────────────────────────────────
    // 4.6 ✅ SEARCH OFF BY PRODUCT NAME AS LAST RESORT
    // ─────────────────────────────────────────────
    if (!productAdditionalInfo?.foodData) {
      const productName = aiRaw?.productDetails?.productName;
      if (productName && productName !== "Unknown") {
        console.log("🔄 Searching OFF by product name:", productName);
        const offByName = await getProductDetailsByName(productName);
        if (offByName) {
          productAdditionalInfo.foodData = offByName;
          console.log("✅ Got OFF data by name!");
        }
      }
    }

    // ─────────────────────────────────────────────
    // 5. FORMAT PRODUCT DETAILS
    // ─────────────────────────────────────────────
    console.log("📝 Step 5: Formatting data...");
    let productDetails = extractAndFormatData(aiRaw);

    if (!productDetails) {
      socket.emit("product-analysis", { isSuccess: false, message: "Data formatting failed" });
      return;
    }

    // ─────────────────────────────────────────────
    // 5.5 ✅ MERGE FROM OPENFOODFACTS
    // ─────────────────────────────────────────────
    console.log("🧪 Step 5.5: Merging from OpenFoodFacts...");
    const offData = productAdditionalInfo?.foodData;

    if (offData) {
      // ✅ Ingredients — Priority: OFF array > OFF text > AI
      if (offData.ingredients?.length > 0) {
        const offIngredients = parseIngredientsArray(offData.ingredients);
        if (offIngredients.length > 0) {
          productDetails.ingredients = offIngredients;
          console.log(`✅ OFF ingredients array: ${offIngredients.length} items`);
        }
      } else if (offData.ingredients_text) {
        const parsed = parseIngredientsText(offData.ingredients_text);
        if (parsed.length > 0) {
          productDetails.ingredients = parsed;
          console.log(`✅ OFF ingredients text: ${parsed.length} items`);
        }
      } else {
        console.log(`⚠️ No OFF ingredients — keeping AI: ${productDetails.ingredients?.length || 0} items`);
      }

      // ✅ Allergens from OFF
      if (offData.allergens_tags?.length > 0 &&
          (!productDetails.allergens || productDetails.allergens.length === 0)) {
        productDetails.allergens = offData.allergens_tags.map(a => a.replace("en:", ""));
        console.log(`✅ OFF allergens: ${productDetails.allergens.length} items`);
      }

      // ✅ Nutrition from OFF
      if (offData.nutriments &&
          (!productDetails.nutrition?.nutritionalValues ||
           productDetails.nutrition.nutritionalValues.length === 0)) {
        const n = offData.nutriments;
        const safeNum = (val) => {
          const num = parseFloat(String(val));
          return isNaN(num) ? null : String(num);
        };
        const nutritionalValues = [
          { nutrient: "Energy",        amount: safeNum(n["energy-kcal_100g"] || n["energy-kcal"]),   unit: "kcal", percentDailyValue: "" },
          { nutrient: "Carbohydrates", amount: safeNum(n["carbohydrates_100g"] || n["carbohydrates"]), unit: "g",   percentDailyValue: "" },
          { nutrient: "Sugar",         amount: safeNum(n["sugars_100g"] || n["sugars"]),               unit: "g",   percentDailyValue: "" },
          { nutrient: "Protein",       amount: safeNum(n["proteins_100g"] || n["proteins"]),           unit: "g",   percentDailyValue: "" },
          { nutrient: "Fat",           amount: safeNum(n["fat_100g"] || n["fat"]),                     unit: "g",   percentDailyValue: "" },
          { nutrient: "Saturated Fat", amount: safeNum(n["saturated-fat_100g"] || n["saturated-fat"]), unit: "g",   percentDailyValue: "" },
          { nutrient: "Fiber",         amount: safeNum(n["fiber_100g"] || n["fiber"]),                 unit: "g",   percentDailyValue: "" },
          { nutrient: "Sodium",        amount: safeNum(n["sodium_100g"] || n["sodium"]),               unit: "g",   percentDailyValue: "" },
        ].filter(n => n.amount !== null && n.amount !== "0");

        if (nutritionalValues.length > 0) {
          productDetails.nutrition.nutritionalValues = nutritionalValues;
          console.log(`✅ OFF nutrition: ${nutritionalValues.length} nutrients`);
        }
      }
    } else {
      console.log("⚠️ No OFF data available — using AI data only");
    }

    console.log(`✅ Final ingredients: ${productDetails.ingredients?.length || 0}`);

    // Separate insights from product details
    let productInsights = {
      overall:      aiRaw.overall      || {},
      user:         aiRaw.user         || {},
      age_groups:   aiRaw.age_groups   || {},
      eco_rating:   aiRaw.eco_rating   || {},
      confidence:   aiRaw.confidence   || {},
      sources:      aiRaw.sources      || [],
      alternatives: aiRaw.alternatives || [],
    };

    console.log("✅ overall rating:", productInsights.overall?.rating);
    console.log("✅ user rating:", productInsights.user?.rating);
    socket.emit("product-analysis", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 6. DATE EXTRACTION
    // ─────────────────────────────────────────────
    console.log("📅 Step 6: Extracting dates...");
    const rawText =
      (aiRaw.rawText?.image1 || "") + " " + (aiRaw.rawText?.image2 || "");
    const dates = extractDates(rawText);
    console.log("✅ Dates:", dates);

    if (dates.manufactureDate)
      productDetails.manufacturing.dates.manufacture = dates.manufactureDate;
    if (dates.expiryDate)
      productDetails.manufacturing.dates.expiry = dates.expiryDate;

    // ─────────────────────────────────────────────
    // 7. ALTERNATIVES + IMAGE UPLOAD IN PARALLEL
    // ─────────────────────────────────────────────
    console.log("🔄 Step 7: Alternatives + image upload...");
    const [enrichedInsights, url1, url2] = await Promise.all([
      getAlternateProductDetails(productInsights, productDetails.productType),
      uploadImages(data[0].file),
      uploadImages(data[1].file),
    ]);

    console.log("✅ url1:", url1);
    console.log("✅ url2:", url2);

    productInsights = enrichedInsights;
    socket.emit("alternative-search", { isSuccess: true });

    // ─────────────────────────────────────────────
    // 8. FINAL PREP
    // ─────────────────────────────────────────────
    console.log("🧹 Step 8: Preparing final data...");
    const finalData = await prepareProductInsight(
      productInsights,
      productDetails,
      productAdditionalInfo,
      { url1, url2 },
      userId
    );

    console.log("✅ finalData:", !!finalData);
    console.log("✅ finalData error:", finalData?.error);

    if (finalData?.error) {
      socket.emit("result-preparation", {
        isSuccess: false,
        message: finalData.error,
      });
      return;
    }

    // ─────────────────────────────────────────────
    // 9. SAVE TO DB
    // ─────────────────────────────────────────────
    console.log("💾 Step 9: Saving to DB...");
    const saved = await new ProductInsight(finalData).save();
    console.log("✅ Saved ID:", saved._id);

    socket.emit("result-preparation", {
      isSuccess: true,
      productInsightId: saved._id,
    });

  } catch (err) {
    console.error("❌ processData error:", err.message);
    console.error("❌ Full error:", err.stack);
    socket.emit("process-error", {
      message: "Something went wrong while processing.",
    });
  }
};

export { processData };