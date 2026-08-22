"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Campaign {
    id: number;
    title: string;
    description?: string;
    discount_percentage?: number;
    target_product?: string;
    expected_revenue_lift?: number;
    projected_revenue?: number;
    status: string;
}

interface Bundle {
    id: number;
    bundle_name: string;
    product_1: string;
    product_2: string;
    bundle_price: number;
    expected_aov_increase: number;
    projected_revenue?: number;
    reasoning?: string;
    status: string;
}

export default function ActionCenterPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [executingCampaignId, setExecutingCampaignId] = useState<number | null>(null);
    const [executingBundleId, setExecutingBundleId] = useState<number | null>(null);
    const [campaignFeedback, setCampaignFeedback] = useState<Record<number, string>>({});
    const [bundleFeedback, setBundleFeedback] = useState<Record<number, string>>({});

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const [cRes, bRes] = await Promise.all([
                fetch(`${baseUrl}/campaigns/`),
                fetch(`${baseUrl}/bundles/`),
            ]);
            if (cRes.ok) setCampaigns(await cRes.json());
            if (bRes.ok) setBundles(await bRes.json());
        } catch (err) {
            console.error("Error fetching action center data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleExecuteCampaign = async (id: number) => {
        try {
            setExecutingCampaignId(id);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute campaign");
            const updated = await res.json();
            setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setCampaignFeedback((prev) => ({ ...prev, [id]: "✓ Executed" }));
            setTimeout(() => {
                setCampaignFeedback((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 4000);
        } catch (err) {
            console.error("Error executing campaign:", err);
        } finally {
            setExecutingCampaignId(null);
        }
    };

    const handleExecuteBundle = async (id: number) => {
        try {
            setExecutingBundleId(id);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/bundles/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute bundle");
            const updated = await res.json();
            setBundles((prev) => prev.map((b) => (b.id === id ? updated : b)));
            setBundleFeedback((prev) => ({ ...prev, [id]: "✓ Published" }));
            setTimeout(() => {
                setBundleFeedback((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 4000);
        } catch (err) {
            console.error("Error executing bundle:", err);
        } finally {
            setExecutingBundleId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ACTIVE
                    </span>
                );
            case "PAUSED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        PAUSED
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        COMPLETED
                    </span>
                );
            case "DRAFT":
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        DRAFT
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                            <span>🚀</span> Action Command Center
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            AI Action Center
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Deploy, activate, and manage autonomous campaigns and product bundles in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/agent-actions"
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            View Execution Logs ⚡
                        </Link>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {refreshing ? "Refreshing..." : "Refresh Status ↺"}
                        </button>
                    </div>
                </div>

                {loading && campaigns.length === 0 && bundles.length === 0 ? (
                    <div className="p-16 text-center text-zinc-500 text-sm animate-pulse">
                        Loading AI actions and operational items...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Campaigns Section */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📢</span>
                                    <div>
                                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                            Campaigns Section
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Promotional discounts and targeted marketing campaigns
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    {campaigns.length} total
                                </span>
                            </div>

                            {campaigns.length === 0 ? (
                                <div className="p-8 text-center text-sm text-zinc-500 space-y-2">
                                    <p>No campaigns generated yet.</p>
                                    <Link
                                        href="/growth"
                                        className="inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400 underline"
                                    >
                                        Generate with AI Copilot →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {campaigns.map((c) => (
                                        <div
                                            key={c.id}
                                            className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                        {c.title}
                                                    </h3>
                                                    {c.target_product && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                            Target: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{c.target_product}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {getStatusBadge(c.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/40 text-xs flex-wrap gap-2">
                                                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 flex-wrap">
                                                    <span>Discount: <strong className="text-zinc-800 dark:text-zinc-200">{c.discount_percentage ?? 10}%</strong></span>
                                                    <span>Lift: <strong className="text-emerald-600 dark:text-emerald-400">+{c.expected_revenue_lift ?? 12.5}%</strong></span>
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                        Projected: ₹{(c.projected_revenue ?? 214707.84).toLocaleString("en-IN")}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {campaignFeedback[c.id] && (
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                                                            {campaignFeedback[c.id]}
                                                        </span>
                                                    )}

                                                    {c.status !== "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleExecuteCampaign(c.id)}
                                                            disabled={executingCampaignId === c.id}
                                                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            {executingCampaignId === c.id ? (
                                                                <>
                                                                    <span className="animate-spin text-xs">🔄</span> Executing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>⚡</span> Execute
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                            <span>✓</span> Active in Store
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bundle Section */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🤝</span>
                                    <div>
                                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                            Bundle Section
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Cross-product pairings designed to increase Average Order Value
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    {bundles.length} total
                                </span>
                            </div>

                            {bundles.length === 0 ? (
                                <div className="p-8 text-center text-sm text-zinc-500 space-y-2">
                                    <p>No bundles generated yet.</p>
                                    <Link
                                        href="/growth"
                                        className="inline-block text-xs font-medium text-teal-600 dark:text-teal-400 underline"
                                    >
                                        Generate with Gemini AI →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bundles.map((b) => (
                                        <div
                                            key={b.id}
                                            className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                        {b.bundle_name}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                        {b.product_1} + {b.product_2}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {getStatusBadge(b.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/40 text-xs flex-wrap gap-2">
                                                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 flex-wrap">
                                                    <span>Price: <strong className="text-zinc-800 dark:text-zinc-200">₹{b.bundle_price.toLocaleString("en-IN")}</strong></span>
                                                    <span>Lift: <strong className="text-teal-600 dark:text-teal-400">+{b.expected_aov_increase}%</strong></span>
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                        Projected: ₹{(b.projected_revenue ?? 225204.66).toLocaleString("en-IN")}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {bundleFeedback[b.id] && (
                                                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 animate-fade-in">
                                                            {bundleFeedback[b.id]}
                                                        </span>
                                                    )}

                                                    {b.status !== "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleExecuteBundle(b.id)}
                                                            disabled={executingBundleId === b.id}
                                                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            {executingBundleId === b.id ? (
                                                                <>
                                                                    <span className="animate-spin text-xs">🔄</span> Publishing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>⚡</span> Execute
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                                                            <span>✓</span> Published in Store
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
