import { searchAmazonProduct } from "../api/amazon-product-search.js";

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("Request timeout")), ms)
    ),
  ]);

// ─────────────────────────────────────────────
// FALLBACK: Open Food Facts ✅ fixed endpoint
// ─────────────────────────────────────────────
const searchOpenFoodFacts = async (productName) => {
  try {
    const query = encodeURIComponent(productName);

    // ✅ v2 API — returns clean JSON always
    const res = await withTimeout(
      fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`,
        {
          headers: {
            // ✅ Required by OpenFoodFacts — without this you get HTML
            "User-Agent": "PurePick/1.0 (purepick.vercel.app)",
            "Accept": "application/json",
          },
        }
      )
    );

    // ✅ Check content type BEFORE parsing
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.log(`⚠️ OpenFoodFacts returned HTML for "${productName}" — skipping`);
      return null;
    }

    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) {
      console.log(`⚠️ OpenFoodFacts: No product found for "${productName}"`);
      return null;
    }

    console.log(`✅ OpenFoodFacts found: ${product.product_name}`);
    return {
      name:     product.product_name     || productName,
      imageUrl: product.image_url        ||
                product.image_front_url  || "",
      link:     `https://world.openfoodfacts.org/product/${product.code}`,
      price:    null,
    };
  } catch (err) {
    console.log(`⚠️ OpenFoodFacts failed for "${productName}":`, err.message);
    return null;
  }
};

// ─────────────────────────────────────────────
// FALLBACK: Open Beauty Facts ✅ fixed endpoint
// ─────────────────────────────────────────────
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
      console.log(`⚠️ OpenBeautyFacts returned HTML for "${productName}" — skipping`);
      return null;
    }

    const data = await res.json();
    const product = data?.products?.[0];
    if (!product) return null;

    console.log(`✅ OpenBeautyFacts found: ${product.product_name}`);
    return {
      name:     product.product_name || productName,
      imageUrl: product.image_url    || "",
      link:     `https://world.openbeautyfacts.org/product/${product.code}`,
      price:    null,
    };
  } catch (err) {
    console.log(`⚠️ OpenBeautyFacts failed for "${productName}":`, err.message);
    return null;
  }
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const getAlternateProductDetails = async (productInsights, productType = "Food") => {
  try {
    if (!productInsights?.alternatives?.length) {
      return productInsights;
    }

    const isBodycare = productType?.toLowerCase() === "bodycare";
    const limitedAlternatives = productInsights.alternatives.slice(0, 5);

    const updatedAlternatives = await Promise.all(
      limitedAlternatives.map(async (alt) => {
        try {
          // 1️⃣ Try Amazon first
          console.log(`🔍 Amazon search for: ${alt.name}`);
          const amazonData = await searchAmazonProduct(alt.name);

          if (amazonData?.success && amazonData?.product) {
            console.log(`✅ Amazon found: ${amazonData.product.title}`);
            return {
              ...alt,
              name:     amazonData.product.title      || alt.name,
              imageUrl: amazonData.product.imageUrl   || alt.imageUrl || "",
              link:     amazonData.product.productUrl || alt.link     || "",
              price:    amazonData.product.price      || alt.price    || null,
            };
          }

          // 2️⃣ Fallback: Open Food/Beauty Facts
          console.log(`⚠️ Amazon failed — trying Open Facts for: ${alt.name}`);
          const fallback = isBodycare
            ? await searchOpenBeautyFacts(alt.name)
            : await searchOpenFoodFacts(alt.name);

          if (fallback) {
            console.log(`✅ Open Facts found for: ${alt.name}`);
            return {
              ...alt,
              name:     fallback.name     || alt.name,
              imageUrl: fallback.imageUrl || alt.imageUrl || "",
              link:     fallback.link     || alt.link     || "",
              price:    fallback.price    || alt.price    || null,
            };
          }

          // 3️⃣ Keep AI data as-is
          console.log(`⚠️ No enrichment found for: ${alt.name} — using AI data`);
          return alt;

        } catch (err) {
          console.log(`⚠️ Enrichment failed for "${alt.name}":`, err.message);
          return alt;
        }
      })
    );

    return {
      ...productInsights,
      alternatives: updatedAlternatives,
    };

  } catch (error) {
    console.log("❌ Alternatives Processing Error:", error.message);
    return productInsights;
  }
};

export default getAlternateProductDetails;