const cleanString = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.trim();
};

const ensureArray = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const safeNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

const extractAndFormatData = (aiData) => {
  try {
    if (!aiData) return null;

    const product = aiData.productDetails || {};
    const nutrition = product.nutrition || {};

    return {
      // ✅ Top level product fields
      productType:    cleanString(product.productType) || "Other",
      productName:    cleanString(product.productName) || "Unknown",
      brand:          cleanString(product.brand)        || "Unknown",
      barcode:        cleanString(product.barcode)      || "Unknown",
      description:    cleanString(product.description)  || "",
      certifications: ensureArray(product.certifications).map(cleanString),
      allergens:      ensureArray(product.allergens).map(cleanString),

      price: {
        amount:   cleanString(product.price?.amount || "0"),
        currency: cleanString(product.price?.currency || "INR"),
      },

      weight: {
        value: cleanString(product.weight?.value || "0"),
        unit:  cleanString(product.weight?.unit  || "g"),
      },

      ingredients: ensureArray(product.ingredients).map((ing) => {
        if (typeof ing === "string") {
          return { name: ing, simplifiedName: ing, quantity: "Unknown", purpose: "Unknown" };
        }
        return {
          name:           cleanString(ing.name),
          simplifiedName: cleanString(ing.simplifiedName || ing.name),
          quantity:       cleanString(ing.quantity       || "Unknown"),
          purpose:        cleanString(ing.purpose        || "Unknown"),
        };
      }),

      // ✅ Full nutrition object
      nutrition: {
        servingInfo: {
          servingSize:        cleanString(nutrition.servingInfo?.servingSize        || ""),
          servingsPerContainer: cleanString(nutrition.servingInfo?.servingsPerContainer || ""),
        },
        nutritionalValues: ensureArray(nutrition.nutritionalValues).map((n) => ({
          nutrient:        cleanString(n.nutrient),
          amount:          cleanString(n.amount),
          unit:            cleanString(n.unit            || ""),
          percentDailyValue: cleanString(n.percentDailyValue || ""),
        })),
       // ✅ Replace dietaryInfo section
dietaryInfo: {
    foodMark: ['veg', 'non-veg', 'vegan'].includes(
        product.nutrition?.dietaryInfo?.foodMark
    )
        ? product.nutrition.dietaryInfo.foodMark
        : undefined, // ✅ undefined not null
    isGlutenFree: product.nutrition?.dietaryInfo?.isGlutenFree || false,
},
      },

      manufacturing: product.manufacturing || {},
      packaging:     product.packaging     || {},
      safety:        product.safety        || {},
      storage:       product.storage       || {},
      usage:         product.usage         || {},
      contact:       product.contact       || {},

      // ✅ Raw text for date extraction
      rawText: aiData.rawText || {},
    };
  } catch (err) {
    console.log("❌ Extract Format Error:", err.message);
    return null;
  }
};

export { extractAndFormatData };