"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";

interface GrowthInsights {
    growth_score: number;
    total_revenue: number;
    total_orders: number;
    product_count: number;
    recommendations: string[];
    ai_analysis: string;
}

interface Campaign {
    id?: number;
    title: string;
    description?: string;
    discount_percentage?: number;
    target_product?: string;
    expected_revenue_lift?: number;
    status: string;
}

interface Bundle {
    id?: number;
    bundle_name: string;
    product_1: string;
    product_2: string;
    bundle_price: number;
    expected_aov_increase: number;
    reasoning?: string;
    status: string;
}

function FormattedAiAnalysis({ content }: { content: string }) {
    const sections = useMemo(() => {
        if (!content) return [];
        const lines = content.split("\n");
        const parsed: { title?: string; items: string[]; intro?: string }[] = [];
        let currentSection: { title?: string; items: string[]; intro?: string } = { items: [] };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "---" || trimmed === "***") continue;

            if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
                if (currentSection.title || currentSection.items.length > 0 || currentSection.intro) {
                    parsed.push(currentSection);
                }
                const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
                currentSection = { title, items: [] };
            } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                const itemText = trimmed.replace(/^[\*\-]\s*/, "");
                currentSection.items.push(itemText);
            } else {
                if (currentSection.items.length === 0 && !currentSection.title) {
                    currentSection.intro = (currentSection.intro ? currentSection.intro + " " : "") + trimmed;
                } else if (currentSection.items.length === 0) {
                    currentSection.intro = (currentSection.intro ? currentSection.intro + " " : "") + trimmed;
                } else {
                    currentSection.items.push(trimmed);
                }
            }
        }
        if (currentSection.title || currentSection.items.length > 0 || currentSection.intro) {
            parsed.push(currentSection);
        }
        return parsed;
    }, [content]);

    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    if (!content) return null;

    return (
        <div className="space-y-4">
            {sections.map((section, sIdx) => (
                <div
                    key={sIdx}
                    className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5"
                >
                    {section.title && (
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                            {section.title}
                        </h4>
                    )}
                    {section.intro && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {renderFormattedText(section.intro)}
                        </p>
                    )}
                    {section.items.length > 0 && (
                        <ul className="space-y-2">
                            {section.items.map((item, iIdx) => (
                                <li
                                    key={iIdx}
                                    className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed"
                                >
                                    <span className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">•</span>
                                    <span>{renderFormattedText(item)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function GrowthPage() {
    const [insights, setInsights] = useState<GrowthInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Campaign State
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [generatingCampaign, setGeneratingCampaign] = useState(false);
    const [updatingCampaignStatus, setUpdatingCampaignStatus] = useState(false);
    const [campaignError, setCampaignError] = useState<string | null>(null);

    // Bundle State
    const [bundle, setBundle] = useState<Bundle | null>(null);
    const [generatingBundle, setGeneratingBundle] = useState(false);
    const [updatingBundleStatus, setUpdatingBundleStatus] = useState(false);
    const [bundleError, setBundleError] = useState<string | null>(null);

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

    const fetchLatestCampaign = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/latest`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setCampaign(data);
                }
            }
        } catch (err) {
            console.error("Error fetching latest campaign:", err);
        }
    }, []);

    const fetchLatestBundle = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/bundles/latest`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setBundle(data);
                }
            }
        } catch (err) {
            console.error("Error fetching latest bundle:", err);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
        fetchLatestCampaign();
        fetchLatestBundle();
    }, [fetchInsights, fetchLatestCampaign, fetchLatestBundle]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    const handleGenerateCampaign = async () => {
        try {
            setGeneratingCampaign(true);
            setCampaignError(null);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to generate campaign");
            }
            const data = await res.json();
            setCampaign(data);
        } catch (err: any) {
            console.error("Error generating campaign:", err);
            setCampaignError(err.message || "Failed to generate campaign");
        } finally {
            setGeneratingCampaign(false);
        }
    };

    const handleUpdateCampaignStatus = async (newStatus: string) => {
        if (!campaign?.id) return;
        try {
            setUpdatingCampaignStatus(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/${campaign.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to update campaign status");
            }
            const updated = await res.json();
            setCampaign(updated);
        } catch (err: any) {
            console.error("Error updating campaign status:", err);
            setCampaignError(err.message || "Failed to update campaign status");
        } finally {
            setUpdatingCampaignStatus(false);
        }
    };

    const handleGenerateBundle = async () => {
        try {
            setGeneratingBundle(true);
            setBundleError(null);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/bundles/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to generate bundle");
            }
            const data = await res.json();
            setBundle(data);
        } catch (err: any) {
            console.error("Error generating bundle:", err);
            setBundleError(err.message || "Failed to generate bundle");
        } finally {
            setGeneratingBundle(false);
        }
    };

    const handleUpdateBundleStatus = async (newStatus: string) => {
        if (!bundle?.id) return;
        try {
            setUpdatingBundleStatus(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/bundles/${bundle.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to update bundle status");
            }
            const updated = await res.json();
            setBundle(updated);
        } catch (err: any) {
            console.error("Error updating bundle status:", err);
            setBundleError(err.message || "Failed to update bundle status");
        } finally {
            setUpdatingBundleStatus(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 60) return "text-blue-600 dark:text-blue-400";
        if (score >= 40) return "text-amber-600 dark:text-amber-400";
        return "text-rose-600 dark:text-rose-400";
    };

    const getCampaignBadgeClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
            case "COMPLETED":
                return "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300 dark:border-purple-700";
            case "DRAFT":
            default:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700";
        }
    };

    const getBundleBadgeClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case "APPROVED":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
            case "REJECTED":
                return "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-700";
            case "DRAFT":
            default:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-700";
        }
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
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 shadow-sm cursor-pointer"
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

                        {/* Action Items & AI Growth Strategy in Clean Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Immediate Action Items (4 cols on desktop) */}
                            <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
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

                            {/* Full AI Analysis Briefing (8 cols on desktop) */}
                            <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <span>🧠</span> Gemini AI Growth Strategy Briefing
                                    </h2>
                                </div>

                                <FormattedAiAnalysis content={insights.ai_analysis} />
                            </div>
                        </div>

                        {/* AI Campaign Generator Card */}
                        <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1.5">
                                        <span>📢</span> Marketing Automation
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        AI Campaign Generator
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Statuses: <strong>DRAFT</strong>, <strong>ACTIVE</strong>, <strong>COMPLETED</strong>.
                                    </p>
                                </div>

                                <button
                                    onClick={handleGenerateCampaign}
                                    disabled={generatingCampaign}
                                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                                >
                                    {generatingCampaign ? (
                                        <>
                                            <span className="animate-spin">🔄</span> Generating Campaign...
                                        </>
                                    ) : (
                                        <>
                                            <span>⚡</span> Generate New Campaign
                                        </>
                                    )}
                                </button>
                            </div>

                            {campaignError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                                    {campaignError}
                                </div>
                            )}

                            {campaign ? (
                                <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                                {campaign.title}
                                            </h3>
                                            {campaign.description && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {campaign.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                Status:
                                            </span>
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getCampaignBadgeClass(campaign.status)}`}>
                                                {campaign.status}
                                            </span>

                                            {/* Status Transition Action Buttons */}
                                            <div className="flex items-center gap-1.5 ml-2">
                                                {campaign.status !== "ACTIVE" && (
                                                    <button
                                                        onClick={() => handleUpdateCampaignStatus("ACTIVE")}
                                                        disabled={updatingCampaignStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                                                        title="Activate Campaign"
                                                    >
                                                        Activate 🚀
                                                    </button>
                                                )}
                                                {campaign.status !== "COMPLETED" && (
                                                    <button
                                                        onClick={() => handleUpdateCampaignStatus("COMPLETED")}
                                                        disabled={updatingCampaignStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 cursor-pointer"
                                                        title="Mark Completed"
                                                    >
                                                        Complete ✅
                                                    </button>
                                                )}
                                                {campaign.status !== "DRAFT" && (
                                                    <button
                                                        onClick={() => handleUpdateCampaignStatus("DRAFT")}
                                                        disabled={updatingCampaignStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50 cursor-pointer"
                                                        title="Set to Draft"
                                                    >
                                                        Draft ↺
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                                        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Discount
                                            </span>
                                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                                                {campaign.discount_percentage ?? 10}%
                                            </span>
                                        </div>

                                        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Expected Revenue Lift
                                            </span>
                                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                                +{campaign.expected_revenue_lift ?? 12.5}%
                                            </span>
                                        </div>

                                        <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Target Product
                                            </span>
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 block truncate">
                                                {campaign.target_product || "Featured Item"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                                    <p className="text-sm text-zinc-500">
                                        No active promotional campaigns. Click below to generate an AI campaign.
                                    </p>
                                    <button
                                        onClick={handleGenerateCampaign}
                                        disabled={generatingCampaign}
                                        className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {generatingCampaign ? "Generating..." : "Generate Campaign"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* AI Bundle Generator Card */}
                        <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1.5">
                                        <span>🤝</span> Cross-Selling Engine
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <span>🤝</span> AI Bundle Generator
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Statuses: <strong>DRAFT</strong>, <strong>APPROVED</strong>, <strong>REJECTED</strong>.
                                    </p>
                                </div>

                                <button
                                    onClick={handleGenerateBundle}
                                    disabled={generatingBundle}
                                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                                >
                                    {generatingBundle ? (
                                        <>
                                            <span className="animate-spin">🔄</span> Generating Bundle...
                                        </>
                                    ) : (
                                        <>
                                            <span>⚡</span> Generate Bundle
                                        </>
                                    )}
                                </button>
                            </div>

                            {bundleError && (
                                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                                    {bundleError}
                                </div>
                            )}

                            {bundle ? (
                                <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                                                Recommended Bundle
                                            </span>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                                {bundle.bundle_name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                Status:
                                            </span>
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getBundleBadgeClass(bundle.status)}`}>
                                                {bundle.status}
                                            </span>

                                            {/* Status Transition Action Buttons */}
                                            <div className="flex items-center gap-1.5 ml-2">
                                                {bundle.status !== "APPROVED" && (
                                                    <button
                                                        onClick={() => handleUpdateBundleStatus("APPROVED")}
                                                        disabled={updatingBundleStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer"
                                                        title="Approve Bundle"
                                                    >
                                                        Approve ✅
                                                    </button>
                                                )}
                                                {bundle.status !== "REJECTED" && (
                                                    <button
                                                        onClick={() => handleUpdateBundleStatus("REJECTED")}
                                                        disabled={updatingBundleStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50 cursor-pointer"
                                                        title="Reject Bundle"
                                                    >
                                                        Reject ✕
                                                    </button>
                                                )}
                                                {bundle.status !== "DRAFT" && (
                                                    <button
                                                        onClick={() => handleUpdateBundleStatus("DRAFT")}
                                                        disabled={updatingBundleStatus}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition disabled:opacity-50 cursor-pointer"
                                                        title="Set to Draft"
                                                    >
                                                        Draft ↺
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products in Bundle */}
                                    <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <div className="sm:col-span-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-center">
                                            <span className="text-xs font-medium text-zinc-400 block mb-1">Item 1</span>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                                                {bundle.product_1}
                                            </span>
                                        </div>

                                        <div className="sm:col-span-1 flex items-center justify-center font-bold text-lg text-teal-600 dark:text-teal-400">
                                            +
                                        </div>

                                        <div className="sm:col-span-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-center">
                                            <span className="text-xs font-medium text-zinc-400 block mb-1">Item 2</span>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                                                {bundle.product_2}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Financial & Lift Metrics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-700/50">
                                        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Bundle Price:
                                            </span>
                                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                                                ₹{bundle.bundle_price.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Expected AOV Increase:
                                            </span>
                                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                                                +{bundle.expected_aov_increase}%
                                            </span>
                                        </div>
                                    </div>

                                    {bundle.reasoning && (
                                        <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                            <span className="text-teal-600 dark:text-teal-400 font-semibold shrink-0">💡 AI Reasoning:</span>
                                            <span className="leading-relaxed">{bundle.reasoning}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                                    <p className="text-sm text-zinc-500">
                                        No active product bundle recommendation. Click below to generate an AI bundle.
                                    </p>
                                    <button
                                        onClick={handleGenerateBundle}
                                        disabled={generatingBundle}
                                        className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {generatingBundle ? "Generating..." : "Generate Bundle"}
                                    </button>
                                </div>
                            )}
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
