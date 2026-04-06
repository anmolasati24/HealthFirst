const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const fetchBarcodeInfo = async (barcode) => {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    const data = await res.json();

    return data.items?.length ? data.items[0] : null;
  } catch (err) {
    console.log("UPC Error:", err.message);
    return null;
  }
};

export { fetchBarcodeInfo };