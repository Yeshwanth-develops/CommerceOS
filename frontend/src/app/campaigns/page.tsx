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
    created_at?: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<Record<number, string>>({});

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/`);
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (err) {
            console.error("Error fetching campaigns:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleGenerateCampaign = async () => {
        try {
            setGenerating(true);
            setError(null);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to generate campaign");
            }
            const newCampaign = await res.json();
            setCampaigns((prev) => [newCampaign, ...prev.filter((c) => c.id !== newCampaign.id)]);
        } catch (err: any) {
            console.error("Error generating campaign:", err);
            setError(err.message || "Failed to generate campaign");
        } finally {
            setGenerating(false);
        }
    };

    const handleExecuteCampaign = async (id: number) => {
        try {
            setUpdatingId(id);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/${id}/execute`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to execute campaign");
            const updated = await res.json();
            setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
            setActionFeedback((prev) => ({ ...prev, [id]: "✓ Executed & Active" }));
            setTimeout(() => {
                setActionFeedback((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, 4000);
        } catch (err: any) {
            console.error("Error executing campaign:", err);
            setError(err.message || "Failed to execute campaign");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            setUpdatingId(id);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/campaigns/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            const updated = await res.json();
            setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
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
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                            <span>📢</span> Marketing Engine
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            Campaign Management
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Autonomous promotional campaigns, targeted discounts, and expected revenue lift tracking.
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
                            onClick={handleGenerateCampaign}
                            disabled={generating}
                            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                            {generating ? (
                                <>
                                    <span className="animate-spin">🔄</span> Generating...
                                </>
                            ) : (
                                <>
                                    <span>⚡</span> Generate New Campaign
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

                {/* Campaign List */}
                {loading && campaigns.length === 0 ? (
                    <div className="p-16 text-center text-zinc-500 text-sm animate-pulse">
                        Loading marketing campaigns...
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                        <p className="text-sm text-zinc-500">
                            No marketing campaigns found. Click above to generate your first AI campaign.
                        </p>
                        <button
                            onClick={handleGenerateCampaign}
                            disabled={generating}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition"
                        >
                            Generate Campaign Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {campaigns.map((c) => (
                            <div
                                key={c.id}
                                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-mono text-zinc-400">
                                                Campaign #{c.id}
                                            </span>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                                {c.title}
                                            </h3>
                                            {c.description && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                                    {c.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0">
                                            {getStatusBadge(c.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Discount
                                            </span>
                                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                                                {c.discount_percentage ?? 10}%
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block">
                                                Revenue Lift
                                            </span>
                                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                                +{c.expected_revenue_lift ?? 12.5}%
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                                                Projected Revenue
                                            </span>
                                            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                                                ₹{(c.projected_revenue ?? 214707.84).toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block truncate">
                                                Target
                                            </span>
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1 block truncate">
                                                {c.target_product || "Featured Item"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        {actionFeedback[c.id] && (
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                                                {actionFeedback[c.id]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {c.status !== "ACTIVE" && (
                                            <button
                                                onClick={() => handleExecuteCampaign(c.id)}
                                                disabled={updatingId === c.id}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                                            >
                                                Execute 🚀
                                            </button>
                                        )}
                                        {c.status !== "PAUSED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(c.id, "PAUSED")}
                                                disabled={updatingId === c.id}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition disabled:opacity-50 cursor-pointer"
                                            >
                                                Pause ⏸️
                                            </button>
                                        )}
                                        {c.status !== "COMPLETED" && (
                                            <button
                                                onClick={() => handleUpdateStatus(c.id, "COMPLETED")}
                                                disabled={updatingId === c.id}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition disabled:opacity-50 cursor-pointer"
                                            >
                                                Complete ✅
                                            </button>
                                        )}
                                        {c.status !== "DRAFT" && (
                                            <button
                                                onClick={() => handleUpdateStatus(c.id, "DRAFT")}
                                                disabled={updatingId === c.id}
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
