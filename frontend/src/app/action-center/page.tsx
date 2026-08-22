"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import API_URL from "@/lib/api";

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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [justRefreshed, setJustRefreshed] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [executingCampaignId, setExecutingCampaignId] = useState<number | null>(null);
    const [executingBundleId, setExecutingBundleId] = useState<number | null>(null);
    const [campaignFeedback, setCampaignFeedback] = useState<Record<number, string>>({});
    const [bundleFeedback, setBundleFeedback] = useState<Record<number, string>>({});

    const fetchData = useCallback(async (isManual: boolean = false) => {
        try {
            if (isManual) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const [cRes, bRes] = await Promise.all([
                fetch(`${API_URL}/campaigns/?_t=${Date.now()}`, { cache: "no-store" }),
                fetch(`${API_URL}/bundles/?_t=${Date.now()}`, { cache: "no-store" }),
            ]);
            if (cRes.ok) setCampaigns(await cRes.json());
            if (bRes.ok) setBundles(await bRes.json());
            if (isManual) {
                setJustRefreshed(true);
                setTimeout(() => setJustRefreshed(false), 1500);
            }
        } catch (err) {
            console.error("Error fetching action center data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    const handleExecuteCampaign = async (id: number) => {
        try {
            setExecutingCampaignId(id);
            const res = await fetch(`${API_URL}/campaigns/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute campaign");
            const updated = await res.json();
            setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setCampaignFeedback((prev) => ({ ...prev, [id]: "✓ Activated in Store" }));
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
            const res = await fetch(`${API_URL}/bundles/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute bundle");
            const updated = await res.json();
            setBundles((prev) => prev.map((b) => (b.id === id ? updated : b)));
            setBundleFeedback((prev) => ({ ...prev, [id]: "✓ Published to Store" }));
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

    // Summary Metrics
    const metrics = useMemo(() => {
        const activeCampaigns = campaigns.filter((c) => c.status?.toUpperCase() === "ACTIVE").length;
        const activeBundles = bundles.filter((b) => b.status?.toUpperCase() === "ACTIVE").length;
        const totalItems = campaigns.length + bundles.length;
        const activeTotal = activeCampaigns + activeBundles;
        return { activeCampaigns, activeBundles, totalItems, activeTotal };
    }, [campaigns, bundles]);

    // Filtering
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesStatus = statusFilter === "ALL" || c.status?.toUpperCase() === statusFilter;
            const matchesSearch =
                !search.trim() ||
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                (c.target_product && c.target_product.toLowerCase().includes(search.toLowerCase()));
            return matchesStatus && matchesSearch;
        });
    }, [campaigns, statusFilter, search]);

    const filteredBundles = useMemo(() => {
        return bundles.filter((b) => {
            const matchesStatus = statusFilter === "ALL" || b.status?.toUpperCase() === statusFilter;
            const matchesSearch =
                !search.trim() ||
                b.bundle_name.toLowerCase().includes(search.toLowerCase()) ||
                b.product_1.toLowerCase().includes(search.toLowerCase()) ||
                b.product_2.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [bundles, statusFilter, search]);

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ACTIVE
                    </span>
                );
            case "PAUSED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        PAUSED
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        COMPLETED
                    </span>
                );
            case "DRAFT":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        DRAFT
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-black p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Top Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                            <span>🚀</span> Autonomous Action & Deployment Hub
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            AI Action Command Center
                        </h1>
                        <p className="text-zinc-500 mt-1 text-sm">
                            Deploy, activate, and manage autonomous campaigns and product bundles in real time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/agent-actions"
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs flex items-center gap-1.5"
                        >
                            <span>⚡</span> View Execution Logs
                        </Link>
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                justRefreshed
                                    ? "bg-emerald-600 text-white dark:bg-emerald-500"
                                    : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
                            } ${isRefreshing ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            <span className={isRefreshing ? "animate-spin inline-block" : ""}>🔄</span>
                            <span>{isRefreshing ? "Syncing..." : justRefreshed ? "✓ Synced" : "Refresh Status"}</span>
                        </button>
                    </div>
                </div>

                {/* 4 Overview KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Active Campaigns
                        </span>
                        <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                            {metrics.activeCampaigns} <span className="text-xs font-medium text-zinc-400">/ {campaigns.length} Live</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Active Bundles
                        </span>
                        <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
                            {metrics.activeBundles} <span className="text-xs font-medium text-zinc-400">/ {bundles.length} Live</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Deployment Pipeline
                        </span>
                        <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {metrics.activeTotal} <span className="text-xs font-medium text-zinc-400">Deployed</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Engine Status
                        </span>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Ready to Execute
                        </div>
                    </div>
                </div>

                {/* Filter & Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 text-sm">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search campaigns or bundles by name or product..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs overflow-x-auto">
                        {[
                            { id: "ALL", label: "All Items" },
                            { id: "ACTIVE", label: "🟢 Active" },
                            { id: "DRAFT", label: "🟡 Draft" },
                            { id: "PAUSED", label: "🔵 Paused" },
                            { id: "COMPLETED", label: "🟣 Completed" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                                    statusFilter === tab.id
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && campaigns.length === 0 && bundles.length === 0 ? (
                    <div className="p-16 text-center text-zinc-500 text-sm animate-pulse">
                        Loading AI action center strategies...
                    </div>
                ) : (
                    /* 2-Column Command Deck */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* 1. Marketing Campaigns Column */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-sm">
                                        📢
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                            Promotional Campaigns
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Automated discount strategies & targeted product sales
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    {filteredCampaigns.length} items
                                </span>
                            </div>

                            {filteredCampaigns.length === 0 ? (
                                <div className="p-10 text-center text-xs text-zinc-500 space-y-2">
                                    <p>No campaigns match your filter.</p>
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {filteredCampaigns.map((c) => (
                                        <div
                                            key={c.id}
                                            className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3 hover:border-purple-300 dark:hover:border-purple-700 transition"
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

                                                <div className="shrink-0">
                                                    {getStatusBadge(c.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/40 text-xs flex-wrap gap-2">
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 flex-wrap">
                                                    <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                                                        {c.discount_percentage ?? 10}% Off
                                                    </span>
                                                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                                                        +{c.expected_revenue_lift ?? 12.5}% Lift
                                                    </span>
                                                    <span className="text-[11px] text-zinc-500 font-mono">
                                                        Proj: ₹{(c.projected_revenue ?? 214707.84).toLocaleString("en-IN")}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {campaignFeedback[c.id] && (
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                            {campaignFeedback[c.id]}
                                                        </span>
                                                    )}

                                                    {c.status !== "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleExecuteCampaign(c.id)}
                                                            disabled={executingCampaignId === c.id}
                                                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 shadow-xs cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            {executingCampaignId === c.id ? (
                                                                <>
                                                                    <span className="animate-spin text-xs">🔄</span> Activating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>⚡</span> Execute
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
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

                        {/* 2. Product Bundles Column */}
                        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-sm">
                                        🤝
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                            Cross-Product Bundles
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Smart pairings designed to maximize Average Order Value
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                    {filteredBundles.length} items
                                </span>
                            </div>

                            {filteredBundles.length === 0 ? (
                                <div className="p-10 text-center text-xs text-zinc-500 space-y-2">
                                    <p>No bundles match your filter.</p>
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {filteredBundles.map((b) => (
                                        <div
                                            key={b.id}
                                            className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition"
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

                                                <div className="shrink-0">
                                                    {getStatusBadge(b.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/40 text-xs flex-wrap gap-2">
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 flex-wrap">
                                                    <span className="bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                                                        ₹{b.bundle_price.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                                                        +{b.expected_aov_increase}% AOV
                                                    </span>
                                                    <span className="text-[11px] text-zinc-500 font-mono">
                                                        Proj: ₹{(b.projected_revenue ?? 225204.66).toLocaleString("en-IN")}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {bundleFeedback[b.id] && (
                                                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                                                            {bundleFeedback[b.id]}
                                                        </span>
                                                    )}

                                                    {b.status !== "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleExecuteBundle(b.id)}
                                                            disabled={executingBundleId === b.id}
                                                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 shadow-xs cursor-pointer flex items-center gap-1.5"
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
                                                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
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
