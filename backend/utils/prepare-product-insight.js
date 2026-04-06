import { User } from "../models/user.js";

const pick = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

const VALID_FOOD_MARKS = ['veg', 'non-veg', 'vegan'];

const prepareProductInsight = async (
  insight,
  extracted,
  apiData,
  images,
  userId
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };

    const off    = apiData?.foodData   || {};
    const beauty = apiData?.beautyData || {};
    const usda   = apiData?.usdaData   || {};

    // ─────────────────────────────────────────────
    // PRODUCT DETAILS
    // ─────────────────────────────────────────────
    const productDetails = {
      productType: extracted?.productType || "Other",

      productName: pick(extracted?.productName, off?.product_name, beauty?.product_name),
      brand:       pick(extracted?.brand, off?.brands, beauty?.brands),
      barcode:     pick(extracted?.barcode),

      description:    pick(extracted?.description, off?.generic_name),
      certifications: pick(extracted?.certifications, []),

      price: {
        amount:   pick(extracted?.price?.amount, ""),
        currency: extracted?.price?.currency || "INR",
      },

      weight: {
        value: pick(extracted?.weight?.value, off?.quantity, ""),
        unit:  extracted?.weight?.unit || "g",
      },

      ingredients: pick(extracted?.ingredients, []),
      allergens:   pick(extracted?.allergens,   []),

      manufacturing: extracted?.manufacturing || {},
      packaging:     extracted?.packaging     || {},
      safety:        extracted?.safety        || {},
      storage:       extracted?.storage       || {},
      usage:         extracted?.usage         || {},
      contact:       extracted?.contact       || {},
    };

    // ─────────────────────────────────────────────
    // NUTRITION
    // ─────────────────────────────────────────────
    const nutritionalValues = extracted?.nutrition?.nutritionalValues || [];

    // ✅ Use extracted not productDetails
    const rawFoodMark = extracted?.nutrition?.dietaryInfo?.foodMark;
    const foodMark = VALID_FOOD_MARKS.includes(rawFoodMark)
      ? rawFoodMark
      : undefined; // ✅ undefined skips validation

    const dietaryInfo = {
      ...(foodMark ? { foodMark } : {}), // ✅ only set if valid
      isGlutenFree: extracted?.nutrition?.dietaryInfo?.isGlutenFree || false,
    };

    // ─────────────────────────────────────────────
    // IMAGES
    // ─────────────────────────────────────────────
    const imageData = {
      image1: images?.url1 || null,
      image2: images?.url2 || null,
    };

    // ─────────────────────────────────────────────
    // FINAL OBJECT
    // ─────────────────────────────────────────────
    return {
      userId,
      userIdCopy: user._id,

      productDetails: {
        ...productDetails,
        nutrition: {
          servingInfo:      extracted?.nutrition?.servingInfo || {},
          nutritionalValues,
          dietaryInfo,      // ✅ clean object, no null foodMark
        },
      },

      images: imageData,

      rawText: extracted?.rawText || {},

      overall:    insight?.overall    || {},
      user:       insight?.user       || {},
      age_groups: insight?.age_groups || {},
      eco_rating: insight?.eco_rating || {},
      confidence: insight?.confidence || {},

      sources:      insight?.sources      || [],
      alternatives: insight?.alternatives || [],
    };

  } catch (err) {
    console.log("❌ Prepare Error:", err.message);
    return { error: "Failed to prepare insight" };
  }
};

export { prepareProductInsight };