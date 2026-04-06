const formatDate = (date) => {
  if (!date || isNaN(date)) return null;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const parseDate = (d, m, y) => {
  if (!m || !y) return null;

  const year = String(y).length === 2 ? `20${y}` : String(y);
  const day = d ? parseInt(d) : 1; // default day to 1 if missing
  const month = isNaN(m)
    ? new Date(Date.parse(m + " 1, 2020")).getMonth() + 1
    : parseInt(m);

  if (month < 1 || month > 12) return null;

  const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  return isNaN(date) ? null : date;
};

const extractDates = (text = "") => {
  try {
    const now = new Date();
    let dates = [];

    // Pattern 1: DD-MM-YYYY, DD/MM/YYYY, DD MMM YYYY
    const regexFull = /\b(\d{1,2})[-\/ ]([A-Za-z]{3}|\d{1,2})[-\/ ](\d{2,4})\b/g;
    let match;
    while ((match = regexFull.exec(text))) {
      const [, d, m, y] = match;
      const date = parseDate(d, m, y);
      if (date) dates.push(date);
    }

    // Pattern 2: MM/YYYY or MM-YYYY (e.g. "10/2023" from Hair & Care)
    const regexMonthYear = /\b(\d{1,2})[\/\-](\d{4})\b/g;
    while ((match = regexMonthYear.exec(text))) {
      const [, m, y] = match;
      const date = parseDate(null, m, y); // no day
      if (date) dates.push(date);
    }

    if (dates.length === 0) {
      return { manufactureDate: null, expiryDate: null };
    }

    // Remove duplicates and sort
    dates = [...new Set(dates.map((d) => d.getTime()))].map((t) => new Date(t));
    dates.sort((a, b) => a - b);

    let manufactureDate = null;
    let expiryDate = null;

    for (let date of dates) {
      if (date <= now && !manufactureDate) {
        manufactureDate = date;
      }
      if (date > now && !expiryDate) {
        expiryDate = date;
      }
    }

    return {
      manufactureDate: formatDate(manufactureDate),
      expiryDate: formatDate(expiryDate),
    };

  } catch (err) {
    console.log("❌ Date Error:", err.message);
    return { manufactureDate: null, expiryDate: null };
  }
};

export { extractDates };