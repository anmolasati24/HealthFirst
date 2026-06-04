import { searchAmazonProduct } from "../api/amazon-product-search.js";
import { GoogleImageCache } from "../models/google-image-cache.js";

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms)
    ),
  ]);

const normalizeName = (name) => String(name || "").trim().toLowerCase().replace(/\s+/g, " ");

const searchOpenFoodFacts = async (productName) => {
  try {
    const query = encodeURIComponent(productName);
    const res = await withTimeout(
      fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`,
        {
          headers: {
            "User-Agent": "PurePick/1.0 (purepick.vercel.app)",
            "Accept": "application/json",
          },
        }
      )
    );

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.log(`[Alternatives] OpenFoodFacts returned non-JSON for "${productName}"`);
      return null;
    }

    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) {
      console.log(`[Alternatives] OpenFoodFacts no result for "${productName}"`);
      return null;
    }

    console.log(`[Alternatives] OpenFoodFacts found: ${product.product_name}`);
    return {
      name: product.product_name || productName,
      imageUrl: product.image_url || product.image_front_url || "",
      link: `https://world.openfoodfacts.org/product/${product.code}`,
      price: null,
    };
  } catch (err) {
    console.log(`[Alternatives] OpenFoodFacts failed for "${productName}": ${err.message}`);
    return null;
  }
};

const searchOpenBeautyFacts = async (productName) => {
  try {
    const query = encodeURIComponent(productName);
    const res = await withTimeout(
      fetch(
        `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`,
        {
          headers: {
            "User-Agent": "PurePick/1.0 (purepick.vercel.app)",
            "Accept": "application/json",
          },
        }
      )
    );

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.log(`[Alternatives] OpenBeautyFacts returned non-JSON for "${productName}"`);
      return null;
    }

    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) {
      console.log(`[Alternatives] OpenBeautyFacts no result for "${productName}"`);
      return null;
    }

    console.log(`[Alternatives] OpenBeautyFacts found: ${product.product_name}`);
    return {
      name: product.product_name || productName,
      imageUrl: product.image_url || "",
      link: `https://world.openbeautyfacts.org/product/${product.code}`,
      price: null,
    };
  } catch (err) {
    console.log(`[Alternatives] OpenBeautyFacts failed for "${productName}": ${err.message}`);
    return null;
  }
};

const getGoogleCache = async (queryKey) => {
  if (!queryKey) return null;
  return GoogleImageCache.findOne({
    queryKey,
    expiresAt: { $gt: new Date() },
  });
};

const setGoogleCache = async (queryKey, query, imageUrl, errorMessage = null) => {
  if (!queryKey) return null;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return GoogleImageCache.findOneAndUpdate(
    { queryKey },
    { query, queryKey, imageUrl: imageUrl || null, error: errorMessage || null, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const getGoogleProductImage = async (productName) => {
  const query = String(productName || "").trim();
  if (!query) {
    console.log("[Google] image search skipped: empty product name");
    return null;
  }

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCx = process.env.GOOGLE_CX;
  if (!googleApiKey || !googleCx) {
    console.log("[Google] image search failed: missing GOOGLE_API_KEY or GOOGLE_CX");
    return null;
  }

  const queryKey = normalizeName(query);
  try {
    const cached = await getGoogleCache(queryKey);
    if (cached) {
      if (cached.imageUrl) {
        console.log(`[Google] cache hit: ${query}`);
      } else {
        console.log(`[Google] cache miss result found with no image: ${query}`);
      }
      return cached.imageUrl || null;
    }

    console.log("[Google] image search start:", query);
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&searchType=image&num=1&key=${encodeURIComponent(googleApiKey)}&cx=${encodeURIComponent(
      googleCx
    )}`;

    const res = await withTimeout(fetch(url), 10000);
    const data = await res.json();

    if (!res.ok) {
      const message = data?.error?.message || `HTTP ${res.status}`;
      console.log("[Google] image search failed:", message);
      await setGoogleCache(queryKey, query, null, message);
      return null;
    }

    const imageUrl = data?.items?.[0]?.link || null;
    if (!imageUrl) {
      console.log("[Google] no image found");
      await setGoogleCache(queryKey, query, null, "No image found");
      return null;
    }

    console.log("[Google] image search success:", imageUrl);
    await setGoogleCache(queryKey, query, imageUrl);
    return imageUrl;
  } catch (error) {
    console.log("[Google] image search failed", error.message);
    await setGoogleCache(queryKey, query, null, error.message);
    return null;
  }
};

const mergeEnrichment = (alt, enrichment) => ({
  ...alt,
  name: enrichment.name || alt.name,
  imageUrl: enrichment.imageUrl || alt.imageUrl || "",
  link: enrichment.link || alt.link || "",
  price: enrichment.price || alt.price || null,
});

const getUniqueTopAlternatives = (alternatives, limit = 2) => {
  const seen = new Set();
  const selected = [];

  for (const alt of alternatives || []) {
    const key = normalizeName(alt?.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    selected.push(alt);
    if (selected.length === limit) break;
  }

  return selected;
};

const enrichAlternative = async (alt, isBodycare) => {
  try {
    console.log(`[Alternatives] enrichment start: ${alt.name}`);
    const amazonData = await searchAmazonProduct(alt.name);

    if (amazonData?.success && amazonData?.product) {
      console.log(`[Alternatives] Amazon selected: ${amazonData.product.title}`);
      const enriched = mergeEnrichment(alt, {
        name: amazonData.product.title,
        imageUrl: amazonData.product.imageUrl,
        link: amazonData.product.productUrl,
        price: amazonData.product.price,
      });
      if (enriched.imageUrl) return enriched;
      // continue to Google fallback if Amazon result had no image
      const googleImage = await getGoogleProductImage(enriched.name);
      if (googleImage) enriched.imageUrl = googleImage;
      return enriched;
    }

    console.log(`[Alternatives] Amazon empty, trying Open Facts: ${alt.name}`);
    const fallback = isBodycare
      ? await searchOpenBeautyFacts(alt.name)
      : await searchOpenFoodFacts(alt.name);

    const merged = fallback ? mergeEnrichment(alt, fallback) : alt;
    if (!merged.imageUrl) {
      const googleImage = await getGoogleProductImage(merged.name || alt.name);
      if (googleImage) merged.imageUrl = googleImage;
    }

    if (merged.imageUrl) return merged;

    console.log(`[Alternatives] no enrichment found, using AI data: ${alt.name}`);
    return merged;
  } catch (err) {
    console.log(`[Alternatives] enrichment failed for "${alt.name}": ${err.message}`);
    return alt;
  }
};

const getAlternateProductDetails = async (productInsights, productType = "Food") => {
  try {
    const alternatives = Array.isArray(productInsights?.alternatives)
      ? productInsights.alternatives
      : [];

    if (alternatives.length === 0) return productInsights;

    const isBodycare = productType?.toLowerCase() === "bodycare";
    const selectedAlternatives = getUniqueTopAlternatives(alternatives, 2);
    const enrichedByName = new Map();

    console.log(`[Alternatives] enriching ${selectedAlternatives.length} of ${alternatives.length} alternatives`);

    for (const alt of selectedAlternatives) {
      const enriched = await enrichAlternative(alt, isBodycare);
      enrichedByName.set(normalizeName(alt.name), enriched);
    }

    return {
      ...productInsights,
      alternatives: alternatives.map((alt) => enrichedByName.get(normalizeName(alt.name)) || alt),
    };
  } catch (error) {
    console.log("[Alternatives] processing error:", error.message);
    return productInsights;
  }
};

export default getAlternateProductDetails;
