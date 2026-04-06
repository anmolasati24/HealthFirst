// API
import { fetchOpenFoodFacts as fetchFood } from "../api/fetch-open-food-facts.js";
import { fetchOpenBeautyFacts as fetchBeauty } from "../api/fetch-open-beauty-facts.js";
import { fetchUSDA } from "../api/fetch-usda.js";

const getProductDetails = async (barcode) => {
  try {
    console.log("🌐 Fetching product details for barcode:", barcode);

    // ─────────────────────────────────────────────
    // 1. No barcode — return empty object
    // ─────────────────────────────────────────────
    if (!barcode) {
      console.log("⚠️ No barcode — skipping API calls");
      return {};
    }

    // ─────────────────────────────────────────────
    // 2. Fetch Food + Beauty facts in parallel
    // ─────────────────────────────────────────────
    const [foodData, beautyData] = await Promise.all([
      fetchFood(barcode),
      fetchBeauty(barcode),
    ]);

    console.log("✅ foodData:", !!foodData);
    console.log("✅ beautyData:", !!beautyData);

    // ─────────────────────────────────────────────
    // 3. USDA fallback if no food data
    // ─────────────────────────────────────────────
    let usdaData = null;
    if (!foodData) {
      console.log("⚠️ No food data — trying USDA...");
      usdaData = await fetchUSDA(barcode);
      console.log("✅ usdaData:", !!usdaData);
    }

    // ─────────────────────────────────────────────
    // 4. Return merged additional info
    // ─────────────────────────────────────────────
    return {
      foodData:   foodData   || null,
      beautyData: beautyData || null,
      usdaData:   usdaData   || null,
    };

  } catch (err) {
    console.error("❌ getProductDetails Error:", err.message);
    return {}; // ✅ return empty object NOT null — prevents crash
  }
};

export { getProductDetails };
// ✅ Add this new export at the bottom
export const getProductDetailsByName = async (productName) => {
  try {
    if (!productName || productName === "Unknown") return null;

    console.log("🔍 Searching OFF by name:", productName);
    const query = encodeURIComponent(productName);
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`,
      {
        headers: {
          "User-Agent": "PurePick/1.0 (purepick.vercel.app)",
          "Accept": "application/json",
        },
      }
    );

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;

    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) return null;

    console.log("✅ OFF found by name:", product.product_name);
    return product;
  } catch (err) {
    console.log("⚠️ OFF name search failed:", err.message);
    return null;
  }
};