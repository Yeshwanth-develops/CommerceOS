"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface GrowthInsights {
    growth_score: number;
    total_revenue: number;
    total_orders: number;
    product_count: number;
    recommendations: string[];
    ai_analysis: string;
}

export default function GrowthPage() {
    const [insights, setInsights] = useState<GrowthInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/growth/`);
            if (!res.ok) throw new Error("Failed to fetch growth insights");
            const data = await res.json();
            setInsights(data);
        } catch (err) {
            console.error("Error fetching growth insights:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 60) return "text-blue-600 dark:text-blue-400";
        if (score >= 40) return "text-amber-600 dark:text-amber-400";
        return "text-rose-600 dark:text-rose-400";
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                            <span>✨</span> AI Merchant Copilot
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            Growth Agent & Intelligence
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Autonomous diagnostic analysis, revenue opportunities, and inventory insights powered by Gemini.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                    >
                        {refreshing ? "Analyzing..." : "Re-run AI Analysis ⚡"}
                    </button>
                </div>

                {loading && !insights ? (
                    <div className="p-16 text-center text-zinc-500 text-sm animate-pulse">
                        Analyzing merchant metrics and generating strategic recommendations...
                    </div>
                ) : insights ? (
                    <div className="space-y-8">
                        {/* Metric Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Growth Score */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Growth Score
                                </div>
                                <div className={`text-4xl font-extrabold mt-2 ${getScoreColor(insights.growth_score)}`}>
                                    {insights.growth_score}
                                    <span className="text-base font-normal text-zinc-400">/100</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="bg-black dark:bg-white h-full rounded-full transition-all duration-500"
                                        style={{ width: `${insights.growth_score}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Total Revenue */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Total Revenue
                                </div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                                    ₹{insights.total_revenue.toLocaleString("en-IN")}
                                </div>
                                <div className="text-xs text-zinc-400 mt-2">
                                    Across all recorded orders
                                </div>
                            </div>

                            {/* Total Orders */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Orders Placed
                                </div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                                    {insights.total_orders}
                                </div>
                                <div className="text-xs text-zinc-400 mt-2">
                                    <Link href="/orders" className="underline hover:text-black dark:hover:text-white">
                                        View order logs →
                                    </Link>
                                </div>
                            </div>

                            {/* Catalog Size */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Active Products
                                </div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                                    {insights.product_count}
                                </div>
                                <div className="text-xs text-zinc-400 mt-2">
                                    <Link href="/products" className="underline hover:text-black dark:hover:text-white">
                                        Manage inventory →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Action Items & Recommendations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Immediate Action Items */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <span>🎯</span> Actionable Priority Items
                                </h2>

                                {insights.recommendations.length === 0 ? (
                                    <p className="text-sm text-zinc-500">
                                        No critical alerts at this time. All inventory levels are healthy!
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {insights.recommendations.map((rec, idx) => (
                                            <li
                                                key={idx}
                                                className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 flex items-start gap-3"
                                            >
                                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                    #{idx + 1}
                                                </span>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Full AI Analysis Briefing */}
                            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <span>🧠</span> Gemini AI Growth Strategy
                                </h2>

                                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                                    {insights.ai_analysis}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                        Unable to load growth insights. Ensure backend server is active.
                    </div>
                )}
            </div>
        </div>
    );
}
