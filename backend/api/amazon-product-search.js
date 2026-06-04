import { fetchAmazon } from "./fetch-amazon.js";

export const searchAmazonProduct = async (productName) => {
  try {
    if (!productName) return { success: false, product: null };

    console.log("[Amazon] product lookup start:", productName);

    const response = await fetchAmazon(productName);
    const products = Array.isArray(response?.products) ? response.products : [];

    console.log("[Amazon] product lookup parsed:", {
      query: productName,
      total_products: response?.total_products || 0,
      products: products.length,
    });

    if (products.length === 0) {
      console.log("[Amazon] no products for:", productName);
      return { success: false, product: null };
    }

    const product = products[0];
    const title = product.product_title || product.title || product.name || productName;
    const imageUrl =
      product.product_photo ||
      product.product_image ||
      product.image ||
      product.thumbnail ||
      "";
    const productUrl = product.product_url || product.url || product.link || "";
    const price = product.product_price || product.price || null;

    console.log("[Amazon] final selected product:", title);

    return {
      success: true,
      product: { title, imageUrl, productUrl, price },
    };
  } catch (error) {
    console.log("[Amazon] product lookup failure:", error.message);
    return { success: false, product: null };
  }
};
