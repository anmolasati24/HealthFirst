import { fetchAmazon } from "./fetch-amazon.js";

export const searchAmazonProduct = async (productName) => {
  try {
    if (!productName) return { success: false, product: null };

    console.log("🔍 Amazon search for:", productName);

    const results = await fetchAmazon(productName);

    console.log("📦 Amazon results type:", typeof results);
    console.log("📦 Amazon results length:", results?.length);

    if (!results || results.length === 0) {
      console.log("⚠️ Amazon: No results for:", productName);
      return { success: false, product: null };
    }

    const product = results[0];
    console.log("📦 Amazon product keys:", Object.keys(product || {}));

    const title =
      product.product_title || product.title || product.name || productName;

    const imageUrl =
      product.product_photo || product.product_image || product.image || product.thumbnail || "";

    const productUrl =
      product.product_url || product.url || product.link || "";

    const price =
      product.product_price || product.price || null;

    return {
      success: true,
      product: { title, imageUrl, productUrl, price },
    };

  } catch (error) {
    console.log("❌ Amazon Search Error:", error.message);
    return { success: false, product: null };
  }
};