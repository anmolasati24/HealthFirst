import { AmazonSearchCache } from "../models/amazon-search-cache.js";

const AMAZON_HOST = "real-time-amazon-data.p.rapidapi.com";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_SPACING_MS = 1000;
const RETRY_DELAYS_MS = [2000, 4000, 8000];
const inFlightSearches = new Map();

let queue = Promise.resolve();
let lastRequestStartedAt = 0;

const normalizeQuery = (query) => String(query || "").trim().toLowerCase().replace(/\s+/g, " ");

const fallbackResponse = (query, reason = "Amazon unavailable") => ({
  total_products: 0,
  products: [],
  query,
  error: reason,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Amazon request timeout")), ms)
    ),
  ]);

const enqueueAmazonRequest = (task) => {
  const run = queue.then(async () => {
    const waitMs = Math.max(0, REQUEST_SPACING_MS - (Date.now() - lastRequestStartedAt));
    if (waitMs > 0) await sleep(waitMs);
    lastRequestStartedAt = Date.now();
    return task();
  });

  queue = run.catch(() => {});
  return run;
};

const logRateLimitHeaders = (res, query) => {
  const limit = res.headers.get("x-ratelimit-requests-limit");
  const remaining = res.headers.get("x-ratelimit-requests-remaining");
  const reset = res.headers.get("x-ratelimit-requests-reset");

  console.log("[Amazon] rate-limit", {
    query,
    limit,
    remaining,
    reset,
  });
};

const parseAmazonResponse = (data, query) => {
  const payload = data?.data || data || {};
  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    total_products: Number(payload?.total_products ?? products.length) || products.length,
    products,
    query,
  };
};

const readCache = async (queryKey, query) => {
  const cached = await AmazonSearchCache.findOne({
    queryKey,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!cached) {
    console.log(`[Amazon] cache miss: ${query}`);
    return null;
  }

  const productsCount = Array.isArray(cached.response?.products)
    ? cached.response.products.length
    : 0;
  console.log(`[Amazon] cache hit: ${query} (${productsCount} products)`);
  return cached.response || fallbackResponse(query, "Malformed cached Amazon response");
};

const writeCache = async (queryKey, query, response) => {
  await AmazonSearchCache.findOneAndUpdate(
    { queryKey },
    {
      query,
      queryKey,
      response,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const requestAmazon = async (query, attempt = 1) => {
  const url = `https://${AMAZON_HOST}/search?query=${encodeURIComponent(query)}&country=IN&sort_by=RELEVANCE&page=1`;

  console.log(`[Amazon] request start: ${query} (attempt ${attempt})`);

  const res = await withTimeout(
    fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": AMAZON_HOST,
      },
    })
  );

  logRateLimitHeaders(res, query);

  if (res.status === 429 && attempt <= RETRY_DELAYS_MS.length) {
    const delay = RETRY_DELAYS_MS[attempt - 1];
    console.log(`[Amazon] 429 retry scheduled: ${query} in ${delay}ms (attempt ${attempt + 1})`);
    await sleep(delay);
    return requestAmazon(query, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`Amazon API status ${res.status}`);
  }

  const data = await res.json();
  const parsed = parseAmazonResponse(data, query);
  console.log(`[Amazon] request success: ${query} (${parsed.products.length}/${parsed.total_products} products)`);
  return parsed;
};

const fetchAmazon = async (query) => {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return fallbackResponse(query, "Missing query");

  if (!process.env.RAPIDAPI_KEY) {
    console.log("[Amazon] RAPIDAPI_KEY not set, skipping search");
    return fallbackResponse(query, "RAPIDAPI_KEY not configured");
  }

  try {
    const cached = await readCache(normalizedQuery, query);
    if (cached) return cached;

    if (inFlightSearches.has(normalizedQuery)) {
      console.log(`[Amazon] duplicate request joined: ${query}`);
      return inFlightSearches.get(normalizedQuery);
    }

    const promise = enqueueAmazonRequest(async () => {
      try {
        const response = await requestAmazon(query);
        await writeCache(normalizedQuery, query, response);
        return response;
      } catch (error) {
        console.log(`[Amazon] request failure: ${query} - ${error.message}`);
        return fallbackResponse(query, error.message);
      } finally {
        inFlightSearches.delete(normalizedQuery);
      }
    });

    inFlightSearches.set(normalizedQuery, promise);
    return promise;
  } catch (error) {
    console.log(`[Amazon] fetch error: ${query} - ${error.message}`);
    return fallbackResponse(query, error.message);
  }
};

export { fetchAmazon };
