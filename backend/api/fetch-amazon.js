const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("Amazon request timeout")), ms)
    ),
  ]);

const fetchAmazon = async (query) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      console.log("⚠️ RAPIDAPI_KEY not set, skipping Amazon search");
      return null;
    }

    if (!query) return null;

    const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=IN&sort_by=RELEVANCE&page=1`;

    const res = await withTimeout(
      fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
        },
      })
    );

    if (!res.ok) {
      console.log(`⚠️ Amazon API status: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log("📦 Amazon keys:", Object.keys(data?.data || {}));

    return data?.data?.products || data?.products || data?.data || null;

  } catch (err) {
    console.log("⚠️ Amazon fetch error:", err.message);
    return null;
  }
};

export { fetchAmazon }; // ✅ named export