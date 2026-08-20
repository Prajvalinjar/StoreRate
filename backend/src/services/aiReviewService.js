/**
 * StoreRate AI-Assisted Review Intelligence Service (Phase 13.1 Refined)
 * Deterministic local NLP engine that analyzes written customer reviews.
 * 
 * IMPORTANT:
 * - Analyzes ONLY written review text (ignores numerical-only ratings).
 * - Scoped strictly to the specific store ID passed in.
 * - Handles 0 written reviews (NO_WRITTEN_REVIEWS), 1-2 written reviews (LOW_SAMPLE), and 3+ (READY).
 */

const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'amazing', 'awesome', 'best', 'delicious', 'fresh',
  'clean', 'friendly', 'fast', 'quick', 'helpful', 'polite', 'loved', 'perfect',
  'hygienic', 'recommend', 'top', 'good', 'nice', 'satisfied', 'quality',
  'prompt', 'value', 'wonderful', 'superb', 'pleasant', 'smooth', 'authentic',
  'tasty', 'affordable', 'neat', 'spotless', 'professional', 'warm'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'poor', 'slow', 'rude', 'dirty', 'overpriced', 'expensive', 'worst',
  'late', 'terrible', 'horrible', 'noisy', 'cold', 'broken', 'disappointed',
  'disappointing', 'waste', 'delay', 'unhelpful', 'unhygienic', 'unfriendly',
  'crowded', 'smelly', 'stale', 'arrogant', 'wrong', 'pricey', 'costly'
]);

const NEGATION_WORDS = new Set([
  'not', 'no', 'never', "wasn't", "isn't", "doesn't", "don't", "can't",
  "couldn't", "won't", "wouldn't", 'hardly', 'barely', 'neither'
]);

const THEMES = [
  {
    name: 'Staff & Service',
    keywords: ['service', 'staff', 'behavior', 'owner', 'support', 'polite', 'helpful', 'rude', 'friendly', 'response', 'counter', 'attitude', 'personnel', 'team', 'employees', 'cashier', 'waiter'],
  },
  {
    name: 'Product & Quality',
    keywords: ['quality', 'delicious', 'food', 'product', 'item', 'taste', 'fresh', 'clean', 'hygienic', 'dirty', 'stale', 'tasty', 'material', 'stock', 'goods', 'dish', 'dishes'],
  },
  {
    name: 'Pricing & Value',
    keywords: ['price', 'pricing', 'cheap', 'reasonable', 'value', 'cost', 'overpriced', 'expensive', 'worth', 'discount', 'bill', 'rate', 'rates', 'affordable', 'pricey', 'costly'],
  },
  {
    name: 'Speed & Waiting Time',
    keywords: ['fast', 'quick', 'speed', 'prompt', 'slow', 'late', 'delay', 'waiting', 'time', 'deliver', 'delivery', 'wait', 'wait time', 'turnaround'],
  },
  {
    name: 'Cleanliness & Ambience',
    keywords: ['ambience', 'atmosphere', 'environment', 'location', 'place', 'setup', 'space', 'seating', 'crowded', 'noisy', 'neat', 'hygiene', 'cleanliness', 'tidy', 'spotless'],
  },
];

/**
 * Analyzes an individual review string using contextual phrase parser & negation logic.
 */
const classifySingleReview = (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { classification: 'NEUTRAL', posScore: 0, negScore: 0, matchedThemes: [], primaryTheme: 'Overall Experience' };
  }

  const cleanText = text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(Boolean);

  let posScore = 0;
  let negScore = 0;

  // Specific Phrase Handling
  if (cleanText.includes('not bad') || cleanText.includes('not terrible')) {
    posScore += 0.5;
  }
  if (cleanText.includes('not good') || cleanText.includes('not helpful') || cleanText.includes('not clean') || cleanText.includes('not fast')) {
    negScore += 1.5;
  }
  if (cleanText.includes('could be better') || cleanText.includes('nothing special') || cleanText.includes('average experience')) {
    posScore += 0.2;
    negScore += 0.2;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const isNegated = NEGATION_WORDS.has(prevWord);

    if (POSITIVE_WORDS.has(word)) {
      if (isNegated) {
        negScore += 1.5; // "not good" -> negative
      } else {
        posScore += 1.0;
      }
    } else if (NEGATIVE_WORDS.has(word)) {
      if (isNegated) {
        posScore += 0.5; // "not bad" -> mildly positive
      } else {
        negScore += 1.2;
      }
    }
  }

  // Identify themes present in text
  const matchedThemes = THEMES.filter((theme) =>
    theme.keywords.some((kw) => cleanText.includes(kw))
  ).map((t) => t.name);

  const primaryTheme = matchedThemes.length > 0 ? matchedThemes[0] : 'Overall Experience';

  let classification = 'NEUTRAL';
  if (posScore > 0 && negScore > 0 && Math.abs(posScore - negScore) <= 0.5) {
    classification = 'NEUTRAL'; // Mixed review
  } else if (posScore > negScore && posScore >= 0.8) {
    classification = 'POSITIVE';
  } else if (negScore > posScore && negScore >= 0.8) {
    classification = 'NEGATIVE';
  }

  return { classification, posScore, negScore, matchedThemes, primaryTheme };
};

/**
 * Attaches a review-level AI tag object to an individual rating object.
 */
const getReviewAITag = (reviewText) => {
  if (!reviewText || typeof reviewText !== 'string' || !reviewText.trim()) {
    return null;
  }
  const result = classifySingleReview(reviewText);
  return {
    sentiment: result.classification,
    theme: result.primaryTheme,
  };
};

/**
 * Analyzes written customer reviews for a single store or platform aggregate.
 * @param {Array} ratingsArray - Array of rating objects containing { review, rating }
 */
const analyzeStoreReviews = (ratingsArray) => {
  try {
    if (!Array.isArray(ratingsArray)) {
      return getFallbackInsights('NO_WRITTEN_REVIEWS');
    }

    // Filter ONLY ratings that have a non-empty written review
    const writtenReviews = ratingsArray.filter(
      (r) => r && typeof r.review === 'string' && r.review.trim().length > 0
    );

    const reviewCount = writtenReviews.length;

    // 0 Written Reviews State
    if (reviewCount === 0) {
      return {
        status: 'NO_WRITTEN_REVIEWS',
        reviewCount: 0,
        sentimentScore: null,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        strengths: [],
        improvements: [],
        actionableSummary: null,
        confidence: 'LOW',
        disclaimer: 'No written reviews submitted yet.',
      };
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    const strengthThemeCounts = {};
    const improvementThemeCounts = {};

    writtenReviews.forEach((r) => {
      const result = classifySingleReview(r.review);

      if (result.classification === 'POSITIVE') {
        positiveCount++;
        result.matchedThemes.forEach((t) => {
          strengthThemeCounts[t] = (strengthThemeCounts[t] || 0) + 1;
        });
      } else if (result.classification === 'NEGATIVE') {
        negativeCount++;
        result.matchedThemes.forEach((t) => {
          improvementThemeCounts[t] = (improvementThemeCounts[t] || 0) + 1;
        });
      } else {
        neutralCount++;
        // If mixed review contains positive or negative keywords, still extract contextual themes
        result.matchedThemes.forEach((t) => {
          if (result.posScore > 0) strengthThemeCounts[t] = (strengthThemeCounts[t] || 0) + 1;
          if (result.negScore > 0) improvementThemeCounts[t] = (improvementThemeCounts[t] || 0) + 1;
        });
      }
    });

    const positivePct = Math.round((positiveCount / reviewCount) * 100);
    const neutralPct = Math.round((neutralCount / reviewCount) * 100);
    const negativePct = Math.round((negativeCount / reviewCount) * 100);

    // Calculate 0-100 Sentiment Score Index (distinct from 1-5 star rating)
    const sentimentScore = Math.min(
      100,
      Math.max(0, Math.round(((positiveCount * 100) + (neutralCount * 50)) / reviewCount))
    );

    // Format strengths with mention counts
    const strengths = Object.entries(strengthThemeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, mentions]) => ({ theme, mentions }))
      .slice(0, 3);

    // Format improvements with mention counts
    const improvements = Object.entries(improvementThemeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, mentions]) => ({ theme, mentions }))
      .slice(0, 3);

    // Fallbacks if zero theme matched
    if (strengths.length === 0 && positiveCount > 0) {
      strengths.push({ theme: 'Staff & Service', mentions: positiveCount });
    }

    // Generate Factual Actionable Summary for Store Owners & Platform Admins
    let actionableSummary = null;
    const topStrength = strengths[0]?.theme;
    const topImprovement = improvements.find((imp) => imp.theme !== topStrength)?.theme || improvements[0]?.theme;

    if (topStrength && topImprovement && topStrength !== topImprovement) {
      actionableSummary = `Customers frequently praise ${topStrength}. ${topImprovement} is the primary area mentioned for improvement.`;
    } else if (topStrength) {
      actionableSummary = `Customers frequently praise ${topStrength}. Overall customer sentiment is predominantly positive.`;
    } else if (topImprovement) {
      actionableSummary = `${topImprovement} was mentioned as the main area for improvement in customer feedback.`;
    } else {
      actionableSummary = 'Customer feedback is evenly distributed across general experience themes.';
    }

    // Determine status & sample confidence
    if (reviewCount < 3) {
      return {
        status: 'LOW_SAMPLE',
        reviewCount,
        sentimentScore,
        sentiment: {
          positive: positivePct,
          neutral: neutralPct,
          negative: negativePct,
        },
        strengths,
        improvements,
        actionableSummary: `Early insight — ${actionableSummary}`,
        confidence: 'LOW',
        disclaimer: 'Early insight — results become more reliable as more customers leave written reviews.',
      };
    }

    return {
      status: 'READY',
      reviewCount,
      sentimentScore,
      sentiment: {
        positive: positivePct,
        neutral: neutralPct,
        negative: negativePct,
      },
      strengths,
      improvements,
      actionableSummary,
      confidence: reviewCount >= 6 ? 'HIGH' : 'MEDIUM',
      disclaimer: 'AI-assisted insights derived from customer written reviews.',
    };
  } catch (err) {
    console.error('Error in analyzeStoreReviews:', err);
    return getFallbackInsights('UNAVAILABLE');
  }
};

const getFallbackInsights = (status = 'UNAVAILABLE') => {
  return {
    status,
    reviewCount: 0,
    sentimentScore: null,
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    strengths: [],
    improvements: [],
    actionableSummary: null,
    confidence: 'LOW',
    disclaimer: 'Review insights are temporarily unavailable.',
  };
};

module.exports = {
  analyzeStoreReviews,
  getReviewAITag,
  getFallbackInsights,
};
