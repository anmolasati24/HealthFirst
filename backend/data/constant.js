// 8901063029170 - jim jam
// 8901088729147 - hair and care
// 8904035416763 - body losen
// 8901396350101 - detol
// 89080146 - nescafe

// ✅ Groq Free Tier Config
// Vision model: meta-llama/llama-4-scout-17b-16e-instruct (supports images)
// Text model:   llama3-70b-8192 (for AI analysis - no vision needed)

export const GROQ_CONFIG = {
  visionModel: "meta-llama/llama-4-scout-17b-16e-instruct", // ✅ Free + Vision
  textModel: "llama3-70b-8192",                             // ✅ Free + Fast
  baseURL: "https://api.groq.com/openai/v1/chat/completions",
};

// ─────────────────────────────────────────────
// GROQ API CALLER — Vision (image extraction)
// ─────────────────────────────────────────────
export async function callGroqVision(base64Image1, base64Image2, additionalInfo = "") {
  const response = await fetch(GROQ_CONFIG.baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_CONFIG.visionModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${extractFormatDataPrompt}\n\nAdditional Info from GoUPC/OpenFoodFacts:\n${additionalInfo}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image1}`,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image2}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,       // ✅ Low temp = consistent JSON
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq Vision Error: ${err.error?.message}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Strip markdown fences if model wraps JSON
  const cleaned = raw.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse JSON from Groq vision response:\n" + cleaned);
  }
}

// ─────────────────────────────────────────────
// GROQ API CALLER — Text (AI Analysis)
// ─────────────────────────────────────────────
export async function callGroqAnalysis(productDetails, productAdditionalInfo, userDetails) {
  const prompt = AIAnalysisPrompt(productDetails, productAdditionalInfo, userDetails);

  const response = await fetch(GROQ_CONFIG.baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_CONFIG.textModel,
      messages: [
        {
          role: "system",
          content:
            "You are a product safety and nutrition expert. Always return ONLY valid JSON. No markdown, no explanation, no preamble.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq Analysis Error: ${err.error?.message}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse JSON from Groq analysis response:\n" + cleaned);
  }
}

// ─────────────────────────────────────────────
// YOUR EXISTING PROMPTS (unchanged)
// ─────────────────────────────────────────────

export const extractFormatDataPrompt = `Task: You are provided with two images that represent the front and back sides of the same product and additional info from GoUPC, OpenFoodFact/OpenBeutyFact and return ONLY a valid JSON response. No additional text or explanations should be included.
1. Extract and separate text from each image
2. Verify if both images belong to the same product

Initial Validation Steps:
1. Extract text from Image 1 and Image 2 separately
2. Compare key identifiers (product type, product name) between images
3. Check if both images show the same product by matching:
   - Product name
   - Product type
   - Package design elements

Things to do carefully:
1. Text Extraction: Extract all visible text from both images, including:
   - Product labels and descriptions
   - Ingredient lists - Accurately identify and list all ingredients with their respective quantities, and add their purposes yourself.
   - Nutritional information
   - Manufacturing details
   - Regulatory information
   - Any additional text present
2. Product Type: Identify whether the product is:
   - Food item
   - Beverage item
   - Body care item
   - Inhale item (e.g. cigarettes)
3. Material Identification: Analyze the product packaging images to identify the materials used. List the materials in descending order of volume as an array in the "type" field (e.g., "glass"). Provide the corresponding volume percentage in the "percentage" field (e.g., XX).
4. Date Processing:
   - Extract dates in priority:
     1. Explicit labels: "Mfg Date:", "Expiry Date:", "Best Before:"
     2. Relative format: "Use within X months from mfg"
     3. Date codes in Batch/Lot numbers
   
   - Rules:
     1. Output format: "DD-MM-YYYY" or "MM-YYYY"
     2. Calculate relative dates from mfg date
     3. Partial dates: Add day=01, year=20XX
     4. Validate: expiry > mfg date
     5. Set null if uncertain

Return ONLY one of these JSON formats:

1. If images show different products:
{
    "error": "different product",
    "rawText": {
        "image1": "string with all text from first image",
        "image2": "string with all text from second image"
    },
    "reason": "string explaining why products are considered different"
}

2. If product is dangerous:
{
    "error": "dangerous product",
    "rawText": {
        "image1": "string with all text from first image",
        "image2": "string with all text from second image"
    },
    "reason": "string explaining why product is dangerous"
}

3. If not a valid product category:
{
    "error": "invalid product category",
    "rawText": {
        "image1": "string with all text from first image",
        "image2": "string with all text from second image"
    },
    "reason": "string explaining why product is not a valid category"
}

4. If validation passes (same product), provide full structured data in JSON format with the following fields only:
{
    "rawText": {
        "image1": "string with all text from first image",
        "image2": "string with all text from second image"
    },
    "productType": "Food | Beverage | Bodycare | Inhale",
    "productName": "string",
    "brand": "string",
    "barcode": "string",
    "description": "string",
    "certifications": ["string"],
    "price": {
        "amount": "string",
        "currency": "string"
    },
    "weight": {
        "value": "string",
        "unit": "string"
    },
    "ingredients": [
        {
            "name": "string",
            "simplifiedName": "string",
            "quantity": "string",
            "purpose": "string"
        }
    ],
    "nutrition": {
        "servingInfo": {
            "servingSize": "string",
            "servingsPerContainer": "string"
        },
        "nutritionalValues": [
            {
                "nutrient": "string",
                "amount": "string",
                "unit": "string",
                "percentDailyValue": "string"
            }
        ],
        "dietaryInfo": {
            "foodMark": "veg | non-veg | vegan",
            "isGlutenFree": "boolean"
        }
    },
    "allergens": ["string"],
    "manufacturing": {
        "manufacturer": "string",
        "locations": ["string"],
        "countryOfOrigin": "string",
        "dates": {
            "manufacture": "string",
            "expiry": "string"
        },
        "batch": "string"
    },
    "packaging": {
        "materials": [
            {
                "materialType": "string",
                "percentage": "string"
            }
        ],
        "disposalInstructions": "string"
    },
    "safety": {
        "warnings": ["string"],
        "restrictions": ["string"]
    },
    "storage": {
        "temperature": "string",
        "condition": "string",
        "shelfLife": "string"
    },
    "usage": {
        "instructions": "string"
    },
    "contact": {
        "phone": ["string"],
        "email": ["string"],
        "website": "string",
        "address": "string"
    }
}`;

export const AIAnalysisPrompt = (productDetails, productAdditionalInfo, userDetails) => {
  return `[ANALYSIS FRAMEWORK]
1. Regulatory & Scientific Research:
   PRIMARY SOURCES:
   - FDA: Latest guidelines, safety assessments, recalls, ingredient restrictions, age-specific guidelines
   - WHO: Global health recommendations, safety standards
   - EFSA: Scientific opinions, risk assessments
   - CDC: Health benchmarks, safety protocols
   - EMA: Safety warnings, approved ingredients
   - FAO: Nutritional guidelines, food safety
   
   SCIENTIFIC SOURCES:
   - PubMed: Clinical trials, health impact studies
   - NIH: Research databases, health guidelines
   - Healthline: Expert-reviewed content, health impacts

2. Comprehensive Analysis Framework (Scale 0-10):
   INGREDIENT SAFETY (40%)
   NUTRITIONAL VALUE (30%)
   HEALTH IMPACT (30%)

RATING GUIDELINES:
- 9-10: Outstanding products with proven excellence
- 7-8: High-quality products with strong benefits
- 5-6: Standard products meeting expectations
- 3-4: Products with quality concerns
- 0-2: Products with serious issues and harmful effects

[RATING MANDATE]
Rate products based on their true quality and value. Pure, natural, and nutritious products deserve highest ratings (9-10). Reserve low ratings (0-3) exclusively for products that are genuinely problematic. Zero rating for banned/dangerous substances.

Rate ALL age groups. Return ONLY valid JSON.

Required JSON Output:
{
    "overall": {
        "rating": 0,
        "reason": "string",
        "key_factors": ["string"]
    },
    "user": {
        "rating": 0,
        "reason": "string",
        "risks": ["string"],
        "benefits": ["string"]
    },
    "age_groups": {
        "baby": { "rating": 0, "reason": "string", "cautions": ["string"] },
        "children": { "rating": 0, "reason": "string", "cautions": ["string"] },
        "teenagers": { "rating": 0, "reason": "string", "cautions": ["string"] },
        "adults": { "rating": 0, "reason": "string", "cautions": ["string"] },
        "seniors": { "rating": 0, "reason": "string", "cautions": ["string"] }
    },
    "eco_rating": {
        "rating": 0,
        "reason": "string",
        "impact_factors": ["string"]
    },
    "confidence": {
        "score": 0,
        "reason": "string",
        "data_quality": "string"
    },
    "sources": [{
        "name": "string",
        "sourceType": "regulatory|scientific|market",
        "link": "string",
        "relevance": "string"
    }],
    "alternatives": [{
        "name": "string",
        "rating": 0,
        "key_benefits": ["string"],
        "health_advantages": ["string"],
        "eco_score": 0,
        "price_comparison": "string",
        "link": "string"
    }]
}

Product Details: ${JSON.stringify(productDetails)}
Product Additional Info: ${JSON.stringify(productAdditionalInfo)}
User Details: ${JSON.stringify(userDetails)}

CRITICAL: Return ONLY valid JSON. No markdown. No explanation. Ratings must be numbers 0-10, never null.`;
};