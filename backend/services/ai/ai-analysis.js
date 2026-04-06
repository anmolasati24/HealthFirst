import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Models to try in order
const MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",  // primary
  "llama-3.3-70b-versatile",                     // fallback 1
  "llama3-70b-8192",                             // fallback 2
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const analyzeProductImages = async (images, userDetails = null) => {
  const imageContents = images.map((img) => {
    let base64 = img.file;
    if (typeof base64 !== "string") base64 = Buffer.from(base64).toString("base64");
    if (base64.includes("base64,")) base64 = base64.split("base64,")[1];
    return {
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${base64}` },
    };
  });

  const userContext = userDetails
    ? `User is ${userDetails.age} years old with conditions: ${userDetails.conditions?.join(", ") || "none"}, allergies: ${userDetails.allergies?.join(", ") || "none"}.`
    : "Assume a healthy adult user.";

  const prompt = `You are a world-class product safety and nutrition expert with deep knowledge of food science, toxicology, and consumer health.

User context: ${userContext}

STRICT RULES:
- Extract EVERY piece of text visible on the packaging
- Give DETAILED ratings 1-10 with thorough explanations (minimum 3-4 sentences)
- NEVER give short reasons like "Refreshing and enjoyable" — explain WHY with science
- List minimum 5 risks and 5 benefits for each section
- List minimum 5 key factors for overall rating
- You MUST provide EXACTLY 4 alternative products — no more, no less
- Alternatives must be real products available in India
- Include mix of Indian and international brands
- Each alternative must be healthier than the scanned product
- productType must be exactly: Food, Beverage, Bodycare, Inhale, or Other
- foodMark must be exactly: veg, non-veg, vegan, or null
- Extract complete 13-digit EAN barcode starting with 890 for Indian products
- For ingredients: list ALL ingredients with E-numbers, purposes and health effects
- For nutrition: extract EXACT values from the label
- Return ONLY valid JSON, no markdown, no explanation

Return ONLY this exact JSON:
{
  "productDetails": {
    "productName": "string",
    "productType": "Food|Beverage|Bodycare|Inhale|Other",
    "brand": "string",
    "barcode": "string",
    "description": "Write a comprehensive 8-10 sentence description covering: what the product is, its main ingredients and their effects, taste/texture/smell, intended use, target audience, health implications, notable features, manufacturing claims, and how it compares to similar products",
    "certifications": ["list ALL certifications visible e.g. FSSAI, ISO, Organic, Non-GMO"],
    "allergens": ["list ALL allergens e.g. gluten, dairy, nuts, soy"],
    "price": { "amount": "0", "currency": "INR" },
    "weight": { "value": "0", "unit": "g or ml" },
    "manufacturing": {
      "manufacturer": "full manufacturer name",
      "locations": ["full manufacturing location"],
      "countryOfOrigin": "string",
      "dates": { "manufacture": "DD-MM-YYYY", "expiry": "DD-MM-YYYY" },
      "batch": "string"
    },
    "packaging": {
      "materials": [{ "materialType": "e.g. PET Plastic Type 1", "percentage": "100%" }],
      "disposalInstructions": "detailed disposal and recycling instructions"
    },
    "safety": {
      "warnings": ["list ALL warnings on package"],
      "restrictions": ["list ALL restrictions e.g. not for children under 12"]
    },
    "storage": {
      "temperature": "e.g. Store below 25 degrees C",
      "condition": "e.g. Keep in cool dry place away from sunlight",
      "shelfLife": "e.g. 12 months from manufacture date"
    },
    "usage": { "instructions": "detailed usage/consumption instructions" },
    "contact": {
      "phone": ["all phone numbers"],
      "email": ["all emails"],
      "website": "full website URL",
      "address": "complete address"
    },
    "nutrition": {
      "servingInfo": {
        "servingSize": "e.g. 250ml",
        "servingsPerContainer": "e.g. 3"
      },
      "nutritionalValues": [
        { "nutrient": "Energy",        "amount": "exact value", "unit": "kcal", "percentDailyValue": "%" },
        { "nutrient": "Carbohydrates", "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Sugar",         "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Protein",       "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Fat",           "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Saturated Fat", "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Sodium",        "amount": "exact value", "unit": "mg",   "percentDailyValue": "%" },
        { "nutrient": "Fiber",         "amount": "exact value", "unit": "g",    "percentDailyValue": "%" },
        { "nutrient": "Calcium",       "amount": "exact value", "unit": "mg",   "percentDailyValue": "%" },
        { "nutrient": "Vitamin C",     "amount": "exact value", "unit": "mg",   "percentDailyValue": "%" }
      ],
      "dietaryInfo": {
        "foodMark": null,
        "isGlutenFree": false
      }
    },
    "ingredients": [
      {
        "name": "exact ingredient name including E-number if applicable",
        "simplifiedName": "common everyday name e.g. Sugar, Citric Acid, Caffeine",
        "quantity": "percentage or amount if visible on label, else Unknown",
        "purpose": "detailed purpose e.g. Sweetener - provides sweetness, Preservative E211 - prevents bacterial growth"
      }
    ]
  },
  "overall": {
    "rating": 6,
    "reason": "Write 4-5 sentences explaining the overall rating. Cover ingredient quality, nutritional value, processing level, presence of additives, and health impact.",
    "key_factors": ["High sugar content at 39g per serving", "Contains artificial flavors", "No preservatives added", "FSSAI certified product", "Low protein content"]
  },
  "user": {
    "rating": 7,
    "reason": "Write 4-5 sentences specifically for this user based on their age, conditions and allergies.",
    "risks": ["High sugar may spike blood glucose", "Sodium content may affect blood pressure", "Artificial flavors may cause reactions", "Phosphoric acid may affect bone density", "Caffeine may disrupt sleep"],
    "benefits": ["Provides quick energy boost", "Carbonation aids digestion", "Good hydration support", "Contains Vitamin C", "Low fat content"]
  },
  "age_groups": {
    "baby": {
      "rating": 1,
      "reason": "3-4 sentences explaining suitability for babies 0-2 years with specific ingredient concerns.",
      "cautions": ["High sugar harmful for developing teeth", "Sodium too high for immature kidneys", "Carbonation causes gas", "No nutritional value for infants"]
    },
    "children": {
      "rating": 3,
      "reason": "3-4 sentences for children 3-12 years covering sugar impact on behavior and dental health.",
      "cautions": ["Excess sugar causes hyperactivity", "Risk of dental cavities", "Empty calories displace nutritious foods", "Caffeine not suitable for children"]
    },
    "teenagers": {
      "rating": 5,
      "reason": "3-4 sentences for teenagers 13-19 years covering caffeine, sugar and bone health.",
      "cautions": ["High sugar contributes to weight gain", "Caffeine may affect sleep quality", "Phosphoric acid weakens bones", "May cause energy crashes"]
    },
    "adults": {
      "rating": 6,
      "reason": "3-4 sentences for adults 20-59 years covering metabolic impact and long-term effects.",
      "cautions": ["Regular consumption linked to obesity", "High sugar raises diabetes risk", "Sodium affects blood pressure", "Artificial additives accumulate over time"]
    },
    "seniors": {
      "rating": 4,
      "reason": "3-4 sentences for seniors 60+ years covering bone density, blood pressure and kidney function.",
      "cautions": ["Phosphoric acid reduces bone density", "High sodium worsens hypertension", "Sugar spikes dangerous for diabetics", "Carbonation may worsen acid reflux"]
    }
  },
  "eco_rating": {
    "rating": 4,
    "reason": "3-4 sentences covering packaging impact, recyclability, carbon footprint and disposal effects.",
    "impact_factors": ["PET plastic takes 450 years to decompose", "Bottle is recyclable if disposed correctly", "High carbon footprint from transportation", "Water intensive manufacturing process"]
  },
  "confidence": {
    "score": 75,
    "reason": "Explain confidence level based on image clarity and text visibility.",
    "data_quality": "Good|Medium|Low"
  },
  "alternatives": [
    {
      "name": "first real alternative product available in India",
      "rating": 8,
      "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
      "health_advantages": ["advantage over scanned product 1", "advantage 2", "advantage 3"],
      "eco_score": 7,
      "price_comparison": "Similar",
      "imageUrl": "",
      "link": "https://www.amazon.in/s?k=product+name"
    },
    {
      "name": "second real alternative product available in India",
      "rating": 7,
      "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
      "health_advantages": ["advantage 1", "advantage 2", "advantage 3"],
      "eco_score": 6,
      "price_comparison": "Cheaper",
      "imageUrl": "",
      "link": "https://www.amazon.in/s?k=product+name"
    },
    {
      "name": "third real alternative product available in India",
      "rating": 8,
      "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
      "health_advantages": ["advantage 1", "advantage 2", "advantage 3"],
      "eco_score": 7,
      "price_comparison": "Similar",
      "imageUrl": "",
      "link": "https://www.amazon.in/s?k=product+name"
    },
    {
      "name": "fourth real alternative product available in India",
      "rating": 9,
      "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
      "health_advantages": ["advantage 1", "advantage 2", "advantage 3"],
      "eco_score": 8,
      "price_comparison": "More expensive",
      "imageUrl": "",
      "link": "https://www.amazon.in/s?k=product+name"
    }
  ],
  "sources": [
    {
      "name": "e.g. FSSAI Guidelines 2023",
      "sourceType": "regulatory|scientific|market",
      "link": "https://exact-source-url.com",
      "relevance": "specific relevance to this product"
    }
  ],
  "rawText": {
    "image1": "paste ALL text visible in first image exactly as it appears",
    "image2": "paste ALL text visible in second image exactly as it appears"
  }
}`;

  // ✅ Try each model with exponential backoff
  for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
    const model = MODELS[modelIndex];

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🤖 Trying model: ${model} (attempt ${attempt})`);

        const response = await groq.chat.completions.create({
          model,
          max_tokens: 6000, // ✅ increased from 4000
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                ...imageContents,
              ],
            },
          ],
        });

        const text = response.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();

        const result = JSON.parse(cleaned);
        console.log("✅ AI Analysis success with:", model);
        console.log("✅ Alternatives count:", result.alternatives?.length);
        return result;

      } catch (err) {
        const is503 = err.message?.includes("503") || err.message?.includes("over capacity");
        const is429 = err.message?.includes("429") || err.message?.includes("rate limit");

        if (is503 || is429) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⚠️ ${model} overloaded. Waiting ${waitTime/1000}s...`);
          await sleep(waitTime);
          continue;
        }

        if (err.message?.includes("JSON")) {
          console.log(`❌ JSON parse failed for ${model}`);
          console.log("Raw response:", text?.slice(0, 500));
          break;
        }

        console.log(`❌ AI Error (${model}):`, err.message);
        break;
      }
    }

    console.log(`⚠️ Moving to next model...`);
  }

  console.log("❌ All models failed");
  return null;
};

export { analyzeProductImages };