const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const fetchOpenFoodFacts = async (barcode) => {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();
    return data.status === 1 ? data.product : null;
  } catch (err) {
    console.log("OFF Error:", err.message);
    return null;
  }
};

export { fetchOpenFoodFacts };