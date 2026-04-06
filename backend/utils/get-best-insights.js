const getBestInsights = (algo, ai) => {
  try {
    if (!algo && !ai) return null;
    if (!algo) return ai;
    if (!ai) return algo;

    const algoConfidence = algo?.confidence?.score || 0;
    const aiConfidence = ai?.confidence?.score || ai?.confidence_score?.score || 0;

    // =========================
    // DECIDE SOURCE
    // =========================
    const useAlgo = algoConfidence > aiConfidence + 15;

    const base = useAlgo ? algo : ai;
    const secondary = useAlgo ? ai : algo;

    // =========================
    // MERGE DATA
    // =========================
    const merged = {
      overall: {
        rating: base.overall?.rating,
        reason:
          base.overall?.reason ||
          secondary.overall?.reason ||
          "",
        confidence: useAlgo ? algoConfidence : aiConfidence,
      },

      // Age groups
      baby: {
        rating: base.baby?.rating || secondary.baby?.rating,
      },
      children: {
        rating: base.children?.rating || secondary.children?.rating,
      },
      teenagers: {
        rating: base.teenagers?.rating || secondary.teenagers?.rating,
      },
      adults: {
        rating: base.adults?.rating || secondary.adults?.rating,
      },
      seniors: {
        rating: base.seniors?.rating || secondary.seniors?.rating,
      },

      // User data (merge both)
      user: {
        rating: base.user?.rating || secondary.user?.rating,
        risks: [
          ...(base.user?.risks || []),
          ...(secondary.user?.risks || []),
        ],
        benefits: [
          ...(base.user?.benefits || []),
          ...(secondary.user?.benefits || []),
        ],
      },

      // Eco
      eco_rating: {
        rating:
          base.eco_rating?.rating ||
          secondary.eco_rating?.rating ||
          5,
      },

      // Confidence
      confidence: {
        score: Math.max(algoConfidence, aiConfidence),
        source: useAlgo ? "algorithm" : "ai",
      },
    };

    // Remove duplicates
    merged.user.risks = [...new Set(merged.user.risks)];
    merged.user.benefits = [...new Set(merged.user.benefits)];

    return merged;
  } catch (err) {
    console.log("❌ Merge Insights Error:", err.message);
    return ai || algo || null;
  }
};

export { getBestInsights };