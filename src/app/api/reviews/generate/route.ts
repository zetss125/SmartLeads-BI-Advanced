import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

function generateProductReviews(productName: string, productDescription: string, count: number = 6) {
  const reviewers = [
    { name: "Alex Chen", avatar: "AC", verified: true, location: "New York, NY" },
    { name: "Maria Santos", avatar: "MS", verified: true, location: "Los Angeles, CA" },
    { name: "James Wilson", avatar: "JW", verified: false, location: "Chicago, IL" },
    { name: "Sophie Turner", avatar: "ST", verified: true, location: "London, UK" },
    { name: "Raj Patel", avatar: "RP", verified: false, location: "Toronto, Canada" },
    { name: "Yuki Tanaka", avatar: "YT", verified: true, location: "Tokyo, Japan" },
    { name: "Olivia Brown", avatar: "OB", verified: true, location: "Sydney, Australia" },
    { name: "Lucas Garcia", avatar: "LG", verified: false, location: "Miami, FL" },
    { name: "Emma Davis", avatar: "ED", verified: true, location: "Seattle, WA" },
    { name: "Noah Kim", avatar: "NK", verified: false, location: "Vancouver, Canada" },
  ];

  const ratings = [5, 4, 3, 2, 1];
  const weightedRatings = [5, 5, 4, 4, 4, 3, 3, 2, 1];

  const reviewTemplates = [
    { rating: 5, title: "Absolutely love it!", pros: ["Amazing quality", "Great value for money", "Exceeded expectations"], cons: ["None so far"] },
    { rating: 5, title: "Best purchase this year", pros: ["Premium build quality", "Excellent customer support", "Fast shipping"], cons: ["Wish I bought it sooner"] },
    { rating: 4, title: "Great product, minor issues", pros: ["Good quality", "Nice design", "Works as advertised"], cons: ["A bit pricey", "Packaging could be better"] },
    { rating: 4, title: "Solid choice overall", pros: ["Reliable performance", "Good materials", "Easy to use"], cons: ["Took a while to arrive", "Manual could be clearer"] },
    { rating: 3, title: "It's okay for the price", pros: ["Decent quality", "Does the job"], cons: ["Not as described", "Average build"] },
    { rating: 2, title: "Not what I expected", pros: ["Looks nice in photos"], cons: ["Poor quality control", "Does not match description", "Overpriced"] },
    { rating: 1, title: "Very disappointed", pros: [], cons: ["Broke after a week", "Terrible customer service", "Not worth the money", "Misleading advertisement"] },
    { rating: 5, title: "Exceeded all expectations", pros: ["Incredible quality", "Beautiful design", "Perfect gift idea"], cons: ["None"] },
    { rating: 4, title: "Highly recommend", pros: ["Great features", "Sleek design", "Fast delivery"], cons: ["Learning curve"] },
    { rating: 3, title: "Mixed feelings", pros: ["Good concept", "Eco-friendly packaging"], cons: ["Execution could be better", "Missing features"] },
  ];

  const reviews = [];
  for (let i = 0; i < count && i < reviewers.length; i++) {
    const reviewer = reviewers[i];
    const rating = weightedRatings[Math.floor(Math.random() * weightedRatings.length)];
    const template = reviewTemplates.find(t => t.rating === rating) || reviewTemplates[0];

    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const body = rating >= 4
      ? `I recently purchased ${productName} and I have to say I'm thoroughly impressed. ${template.pros[0]}, and the overall experience has been wonderful. ${template.cons[0] !== "None" && template.cons[0] !== "None so far" ? `The only downside is that ${template.cons[0].toLowerCase()}.` : "Would definitely recommend to anyone looking for a quality product."}`
      : rating === 3
        ? `I've been using ${productName} for a few days now. ${template.pros[0]}, but ${template.cons ? template.cons[0].toLowerCase() : "it could be better"}. It's an okay product for the price point.`
        : `I had high hopes for ${productName} based on the reviews, but unfortunately it didn't live up to the hype. ${template.cons.slice(0, 2).join(". ")}. Very disappointed with this purchase.`;

    const helpful = Math.floor(Math.random() * 150) + 5;

    reviews.push({
      id: `rev_${i + 1}`,
      productName,
      productDescription,
      reviewer: {
        name: reviewer.name,
        avatar: reviewer.avatar,
        verified: reviewer.verified,
        location: reviewer.location
      },
      rating,
      title: template.title,
      body,
      pros: template.pros.slice(0, 2),
      cons: rating < 5 ? template.cons.slice(0, 2) : [],
      date: date.toISOString(),
      helpful,
      verifiedPurchase: Math.random() > 0.3,
      wouldRecommend: rating >= 4 ? "Yes" : rating === 3 ? "Maybe" : "No"
    });
  }

  return reviews;
}

function ensureReviewIds(reviews: any[]): any[] {
  return reviews.map((r, i) => ({ ...r, id: r.id || `rev_${Date.now()}_${i}` }));
}

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription, count = 6 } = await req.json();

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

    if (!apiKey) {
      const generated = generateProductReviews(productName, productDescription, count);
      const reviews = ensureReviewIds(generated);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return NextResponse.json({
        success: true,
        reviews,
        summary: {
          totalReviews: reviews.length,
          averageRating: parseFloat(avgRating.toFixed(1)),
          ratingDistribution: {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
          },
          recommendedPercent: parseFloat(((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100).toFixed(0))
        }
      });
    }

    try {
      const prompt = `Generate ${count} realistic product reviews for the following product:

Product Name: ${productName}
Product Description: ${productDescription || "No description provided"}

Generate a diverse set of reviews with different ratings (1-5 stars) and detailed feedback. Include pros and cons for each review.

Respond ONLY with a JSON object in this exact format:
{
  "reviews": [
    {
      "reviewer": { "name": "string", "verified": true/false, "location": "string" },
      "rating": 1-5,
      "title": "string",
      "body": "string (detailed review, 2-4 sentences)",
      "pros": ["string", "string"],
      "cons": ["string", "string"],
      "verifiedPurchase": true/false,
      "wouldRecommend": "Yes/Maybe/No"
    }
  ],
  "summary": {
    "totalReviews": number,
    "averageRating": number,
    "ratingDistribution": { "5": number, "4": number, "3": number, "2": number, "1": number },
    "recommendedPercent": number
  }
}`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      let content = response.data?.choices?.[0]?.message?.content?.trim() || "";
      if (content.startsWith("```")) {
        content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(content);
      if (parsed.reviews) parsed.reviews = ensureReviewIds(parsed.reviews);
      return NextResponse.json({ success: true, ...parsed });
    } catch {
      const generated = generateProductReviews(productName, productDescription, count);
      const reviews = ensureReviewIds(generated);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      return NextResponse.json({
        success: true,
        reviews,
        summary: {
          totalReviews: reviews.length,
          averageRating: parseFloat(avgRating.toFixed(1)),
          ratingDistribution: {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
          },
          recommendedPercent: parseFloat(((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100).toFixed(0))
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
