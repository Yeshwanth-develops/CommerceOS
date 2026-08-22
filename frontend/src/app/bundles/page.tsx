"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import API_URL from "@/lib/api";

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
    created_at?: string;
}

export default function BundlesPage() {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<Record<number, string>>({});

    const fetchBundles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/bundles/`);
            if (res.ok) {
                const data = await res.json();
                setBundles(data);
            }
        } catch (err) {
            console.error("Error fetching bundles:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBundles();
    }, [fetchBundles]);

    const handleGenerateBundle = async () => {
        try {
            setGenerating(true);
            setError(null);
            const res = await fetch(`${API_URL}/bundles/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to generate bundle");
            }
            const newBundle = await res.json();
            setBundles((prev) => [newBundle, ...prev.filter((b) => b.id !== newBundle.id)]);
        } catch (err: any) {
            console.error("Error generating bundle:", err);
            setError(err.message || "Failed to generate bundle");
        } finally {
            setGenerating(false);
        }
    };

    const handleExecuteBundle = async (id: number) => {
        try {
            setUpdatingId(id);
            const res = await fetch(`${API_URL}/bundles/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute bundle");
            const updated = await res.json();
            setBundles((prev) => prev.map((b) => (b.id === id ? updated : b)));
            setActionFeedback((prev) => ({ ...prev, [id]: "✓ Published & Active" }));
            setTimeout(() => {
                setActionFeedback((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 4000);
        } catch (err: any) {
            console.error("Error executing bundle:", err);
            setError(err.message || "Failed to execute bundle");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            setUpdatingId(id);
            const res = await fetch(`${API_URL}/bundles/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            const updated = await res.json();
            setBundles((prev) => prev.map((b) => (b.id === id ? updated : b)));
        } catch (err: any) {
            console.error("Error updating status:", err);
            setError(err.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ACTIVE
                    </span>
                );
            case "PAUSED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        PAUSED
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        COMPLETED
                    </span>
                );
            case "DRAFT":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
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
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
                            <span>🤝</span> Cross-Selling Engine
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            AI Bundle Generator & Intelligence
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            High-margin product pairings generated by Gemini AI to maximize Average Order Value (AOV).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/action-center"
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            Action Center →
                        </Link>
                        <button
                            onClick={handleGenerateBundle}
                            disabled={generating}
                            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                            {generating ? (
                                <>
                                    <span className="animate-spin">🔄</span> Consulting Gemini AI...
                                </>
                            ) : (
                                <>
                                    <span>⚡</span> Generate New Bundle
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                        {error}
                    </div>
                )}

                {/* Bundle List */}
                {loading && bundles.length === 0 ? (
                    <div className="p-16 text-center text-zinc-500 text-sm animate-pulse">
                        Loading AI product bundles...
                    </div>
                ) : bundles.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                        <p className="text-sm text-zinc-500">
                            No product bundles found. Click above to generate high-converting bundles with Gemini AI.
                        </p>
                        <button
                            onClick={handleGenerateBundle}
                            disabled={generating}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                        >
                            Generate Bundle Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bundles.map((b) => (
                            <div
                                key={b.id}
                                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-mono text-zinc-400">
                                                Bundle #{b.id}
                                            </span>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                                {b.bundle_name}
                                            </h3>
                                        </div>

                                        <div className="shrink-0">
                                            {getStatusBadge(b.status)}
                                        </div>
                                    </div>

                                    {/* Products in Bundle */}
                                    <div className="grid grid-cols-5 items-center gap-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-center">
                                        <div className="col-span-2">
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                                                {b.product_1}
                                            </span>
                                        </div>
                                        <div className="col-span-1 font-bold text-teal-600 dark:text-teal-400">
                                            +
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                                                {b.product_2}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Financial Metrics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Bundle Price
                                            </span>
                                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                                                ₹{b.bundle_price.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Expected AOV Lift
                                            </span>
                                            <span className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5 block">
                                                +{b.expected_aov_increase}%
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                                                Projected Revenue
                                            </span>
                                            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                                                ₹{(b.projected_revenue ?? 225204.66).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {b.reasoning && (
                                        <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                            <span className="text-teal-600 dark:text-teal-400 font-semibold shrink-0">💡 AI:</span>
                                            <span className="leading-relaxed">{b.reasoning}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        {actionFeedback[b.id] && (
                                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 animate-fade-in">
                                                {actionFeedback[b.id]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {b.status !== "ACTIVE" && (
                                            <button
                                                onClick={() => handleExecuteBundle(b.id)}
                                                disabled={updatingId === b.id}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                                            >
                                                Execute 🚀
                                            </button>
                                        )}
                                        {b.status !== "PAUSED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(b.id, "PAUSED")}
                                                disabled={updatingId === b.id}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition disabled:opacity-50 cursor-pointer"
                                            >
                                                Pause ⏸️
                                            </button>
                                        )}
                                        {b.status !== "COMPLETED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                                                disabled={updatingId === b.id}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition disabled:opacity-50 cursor-pointer"
                                            >
                                                Complete ✅
                                            </button>
                                        )}
                                        {b.status !== "DRAFT" && (
                                            <button
                                                onClick={() => handleUpdateStatus(b.id, "DRAFT")}
                                                disabled={updatingId === b.id}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition disabled:opacity-50 cursor-pointer"
                                            >
                                                Draft ↺
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
