"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Star,
  Camera,
  Video,
  Upload,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Review {
  id: string;
  productName: string;
  productDescription: string;
  reviewer: {
    name: string;
    avatar: string;
    verified: boolean;
    location: string;
  };
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  date: string;
  helpful: number;
  verifiedPurchase: boolean;
  wouldRecommend: string;
}

interface AnalysisResult {
  strategy: string;
  recommendations: { priority: string; action: string; impact: string }[];
}

export default function CompetitorReviewsPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
    recommendedPercent: number;
  } | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
      if (!productName) {
        setProductName(fileName);
      }
    }
  };

  const generateReviews = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setReviews([]);
    setSummary(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/reviews/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          count: 8,
        }),
      });
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setSummary(data.summary);
      }
    } catch {
      console.error("Failed to generate reviews");
    } finally {
      setLoading(false);
    }
  };

  const analyzeReviews = async () => {
    if (reviews.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/competitor-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews,
          productName: productName.trim(),
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      console.error("Failed to analyze reviews");
    } finally {
      setAnalyzing(false);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200 dark:text-slate-600"
          }`}
        />
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Competitor Review Analysis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Upload a product image or video ad, or enter product details to generate and
            analyze competitor reviews
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
              Product Details
            </h2>

            <div className="space-y-4">
              <div
                className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                {uploadedFile ? (
                  <>
                    {uploadedFile.type.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(uploadedFile)}
                        className="h-24 w-full object-cover rounded-lg mb-2"
                        controls
                      />
                    ) : uploadedFile.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt="Preview"
                        className="h-24 w-full object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                    )}
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {uploadedFile.name}
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">
                      Upload product image or video
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WEBP, MP4, WebM or MOV
                    </p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Galaxy S25 Ultra"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe the product features, target market..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:text-white resize-none"
                />
              </div>

              <button
                onClick={generateReviews}
                disabled={loading || !productName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Reviews...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    Generate Reviews
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {reviews.length > 0 && summary && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Reviews for {productName}
                  </h2>
                  <a
                    href="#"
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    View Mock Review Site
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {summary.averageRating}
                    </p>
                    <StarRating rating={Math.round(summary.averageRating)} />
                    <p className="text-xs text-slate-500 mt-1">
                      {summary.totalReviews} reviews
                    </p>
                  </div>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-slate-500 w-3">{star}</span>
                      <Star className="h-3 w-3 text-amber-400" />
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${
                              summary.totalReviews > 0
                                ? ((summary.ratingDistribution[star] || 0) /
                                    summary.totalReviews) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-6">
                        {summary.ratingDistribution[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div
                      key={review.id || `review_${idx}_${review.title}`}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                            {review.reviewer.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {review.reviewer.name}
                              {review.reviewer.verified && (
                                <span className="ml-1 text-emerald-500 text-xs">
                                  &#10003;
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {review.reviewer.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StarRating rating={review.rating} />
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">
                        {review.title}
                      </h4>

                      <p
                        className={`text-sm text-slate-600 dark:text-slate-400 ${
                          expandedReview !== review.id ? "line-clamp-2" : ""
                        }`}
                      >
                        {review.body}
                      </p>

                      {(review.pros.length > 0 || review.cons.length > 0) && (
                        <div className="mt-2 flex gap-4 text-xs">
                          {review.pros.length > 0 && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{review.pros.slice(0, 2).join(", ")}</span>
                            </div>
                          )}
                          {review.cons.length > 0 && (
                            <div className="flex items-center gap-1 text-rose-600">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{review.cons.slice(0, 2).join(", ")}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span>{review.helpful} people found this helpful</span>
                        {review.verifiedPurchase && (
                          <span className="text-emerald-500">
                            Verified Purchase
                          </span>
                        )}
                        {review.body.length > 150 && (
                          <button
                            onClick={() =>
                              setExpandedReview(
                                expandedReview === review.id
                                  ? null
                                  : review.id
                              )
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            {expandedReview === review.id
                              ? "Show less"
                              : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!analysis && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={analyzeReviews}
                      disabled={analyzing}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing Reviews...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4" />
                          Generate Competitor Strategy Report
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {analysis && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Competitor Strategy Report
                  </h2>
                </div>

                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-6">
                  {analysis.strategy.split("\n").map((line, i) => (
                    <p key={i} className="mb-1">
                      {line || "\u00A0"}
                    </p>
                  ))}
                </div>

                {analysis.recommendations.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Strategic Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
                        >
                          <div
                            className={`p-1.5 rounded-lg ${
                              rec.priority === "High"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                : rec.priority === "Medium"
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            }`}
                          >
                            {rec.priority === "High" ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : rec.priority === "Medium" ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {rec.action}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Impact: {rec.impact}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              rec.priority === "High"
                                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                : rec.priority === "Medium"
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && reviews.length === 0 && !summary && (
              <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                  <Star className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Enter a product name or upload an image, then click
                  &quot;Generate Reviews&quot; to create mock competitor reviews
                  and get strategic insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
