import { Ingredient } from "../models/ingredient.js";
import { User } from "../models/user.js";

const getCustomAnalysis = async ({ data, userId }) => {
  try {
    const analysis = {
      overall: { rating: 0 },
      user: { rating: 0, risks: [], benefits: [] },
      baby: { rating: 0, risks: [], benefits: [] },
      children: { rating: 0, risks: [], benefits: [] },
      teenagers: { rating: 0, risks: [], benefits: [] },
      adults: { rating: 0, risks: [], benefits: [] },
      seniors: { rating: 0, risks: [], benefits: [] },
      ecoRating: 5,
      confidence: { score: 0 },
    };

    const ingredients = data.ingredients || [];
    const n = ingredients.length || 1;

    // 🔥 Fetch all ingredients in ONE query (optimized)
    const names = ingredients.map((i) => i.name);
    const dbIngredients = await Ingredient.find({
      aliases: { $in: names },
    });

    const user = await User.findById(userId);

    let missing = 0;
    let riskCount = 0;

    for (let item of ingredients) {
      const ingredient = dbIngredients.find((ing) =>
        ing.aliases.includes(item.name)
      );

      if (!ingredient) {
        missing++;
        continue;
      }

      const health = ingredient.healthInfo;

      // =====================
      // ADD RATINGS
      // =====================
      analysis.overall.rating += health.overallRating;

      analysis.baby.rating += health.ageGroups.baby.rating;
      analysis.children.rating += health.ageGroups.children.rating;
      analysis.teenagers.rating += health.ageGroups.teenagers.rating;
      analysis.adults.rating += health.ageGroups.adults.rating;
      analysis.seniors.rating += health.ageGroups.seniors.rating;

      // =====================
      // ADD RISKS/BENEFITS
      // =====================
      const add = (group, target) => {
        target.risks.push(...group.risks);
        target.benefits.push(...group.benefits);
      };

      add(health.ageGroups.baby, analysis.baby);
      add(health.ageGroups.children, analysis.children);
      add(health.ageGroups.teenagers, analysis.teenagers);
      add(health.ageGroups.adults, analysis.adults);
      add(health.ageGroups.seniors, analysis.seniors);

      // =====================
      // USER RISK CHECK
      // =====================
      const allergyHits = user.allergies.filter((a) =>
        health.allergies?.some((i) => i.name === a)
      ).length;

      const diseaseHits = user.diseases.filter((d) =>
        health.diseases?.some((i) => i.name === d)
      ).length;

      riskCount += allergyHits + diseaseHits;
    }

    // =====================
    // AGE BASED USER DATA
    // =====================
    const getAgeGroup = () => {
      const age = user.age;

      if (age <= 2) return analysis.baby;
      if (age <= 12) return analysis.children;
      if (age <= 19) return analysis.teenagers;
      if (age <= 59) return analysis.adults;
      return analysis.seniors;
    };

    const ageGroup = getAgeGroup();

    analysis.user.risks = ageGroup.risks;
    analysis.user.benefits = ageGroup.benefits;

    analysis.user.rating = ageGroup.rating;

    // =====================
    // APPLY PENALTIES
    // =====================
    analysis.user.rating /= Math.pow(2, riskCount);

    // =====================
    // NORMALIZE
    // =====================
    const normalize = (val) => Math.max(1, Math.min(10, val / n));

    analysis.overall.rating = normalize(analysis.overall.rating);
    analysis.user.rating = normalize(analysis.user.rating);
    analysis.baby.rating = normalize(analysis.baby.rating);
    analysis.children.rating = normalize(analysis.children.rating);
    analysis.teenagers.rating = normalize(analysis.teenagers.rating);
    analysis.adults.rating = normalize(analysis.adults.rating);
    analysis.seniors.rating = normalize(analysis.seniors.rating);

    // =====================
    // CONFIDENCE
    // =====================
    analysis.confidence.score = Math.max(
      0,
      100 - (missing / n) * 100
    );

    return analysis;
  } catch (err) {
    console.log("❌ Custom Analysis Error:", err.message);
    return null;
  }
};

export { getCustomAnalysis };