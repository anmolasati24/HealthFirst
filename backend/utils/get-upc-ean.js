const getUpcOrEan = (barcodeInfo = []) => {
  try {
    if (!Array.isArray(barcodeInfo) || barcodeInfo.length === 0) {
      return null;
    }

    let ean = null;
    let upc = null;

    for (const item of barcodeInfo) {
      const format = item?.barcodeFormat?.toUpperCase() || "";
      const value = item?.parsedResult;

      if (!value) continue;

      // Prefer EAN (more common globally)
      if (format.includes("EAN") && !ean) {
        ean = value;
      }

      // Fallback UPC
      if (format.includes("UPC") && !upc) {
        upc = value;
      }
    }

    return ean || upc || null;

  } catch (err) {
    console.log("❌ Barcode Extract Error:", err.message);
    return null;
  }
};

export { getUpcOrEan };