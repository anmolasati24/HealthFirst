const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const fetchUSDA = async (productName) => {
  try {
    if (!process.env.USDA_API_KEY) return null;

    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${productName}&api_key=${process.env.USDA_API_KEY}`
    );

    const data = await res.json();
    return data.foods?.[0] || null;
  } catch (err) {
    console.log("USDA Error:", err.message);
    return null;
  }
};

export { fetchUSDA };