"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatISTDateTime } from "@/lib/dateUtils";

interface AuditLog {
    id: number;
    event_type: string;
    entity_type: string;
    entity_id: number | null;
    description: string | null;
    created_at: string;
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [justRefreshed, setJustRefreshed] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchLogs = useCallback(async (isManual: boolean = false) => {
        try {
            if (isManual) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/audit/?_t=${Date.now()}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error("Failed to fetch audit logs");
            const data = await res.json();
            setLogs(data);
            if (isManual) {
                setJustRefreshed(true);
                setTimeout(() => setJustRefreshed(false), 1500);
            }
        } catch (err) {
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(false);
    }, [fetchLogs]);

    // Copy Log ID handler
    const handleCopyId = (id: number) => {
        navigator.clipboard.writeText(`LOG-#${id}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // Export audit logs as JSON file
    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `argos_audit_ledger_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    // Computed Compliance Metrics
    const metrics = useMemo(() => {
        const total = logs.length;
        const aiActions = logs.filter((l) => l.event_type.includes("AI_") || l.event_type.includes("RECOMMENDATION")).length;
        const paymentEvents = logs.filter((l) => l.event_type.includes("PAYMENT") || l.event_type.includes("REFUND")).length;
        const inventoryEvents = logs.filter((l) => l.event_type.includes("PRODUCT")).length;
        return { total, aiActions, paymentEvents, inventoryEvents };
    }, [logs]);

    // Filtering
    const filteredLogs = useMemo(() => {
        let list = [...logs];

        if (categoryFilter === "AI") {
            list = list.filter((l) => l.event_type.includes("AI_") || l.event_type.includes("RECOMMENDATION"));
        } else if (categoryFilter === "PAYMENTS") {
            list = list.filter((l) => l.event_type.includes("PAYMENT") || l.event_type.includes("REFUND"));
        } else if (categoryFilter === "MARKETING") {
            list = list.filter((l) => l.event_type.includes("CAMPAIGN") || l.event_type.includes("BUNDLE"));
        } else if (categoryFilter === "INVENTORY") {
            list = list.filter((l) => l.event_type.includes("PRODUCT") || l.event_type.includes("STOCK"));
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (l) =>
                    l.event_type.toLowerCase().includes(q) ||
                    l.entity_type.toLowerCase().includes(q) ||
                    l.id.toString().includes(q) ||
                    (l.description && l.description.toLowerCase().includes(q))
            );
        }

        return list;
    }, [logs, categoryFilter, search]);

    const getEventBadge = (eventType: string) => {
        const styles: Record<string, { bg: string; dot: string }> = {
            AI_ACTION_EXECUTED: {
                bg: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                dot: "bg-purple-500",
            },
            PAYMENT_VERIFIED: {
                bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                dot: "bg-emerald-500",
            },
            PAYMENT_FAILED: {
                bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
                dot: "bg-rose-500",
            },
            PRODUCT_CREATED: {
                bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                dot: "bg-blue-500",
            },
            PRODUCT_UPDATED: {
                bg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
                dot: "bg-cyan-500",
            },
            AI_CAMPAIGN_CREATED: {
                bg: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
                dot: "bg-fuchsia-500",
            },
            AI_BUNDLE_CREATED: {
                bg: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800",
                dot: "bg-teal-500",
            },
            AI_RECOMMENDATION: {
                bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                dot: "bg-amber-500",
            },
            ORDER_CREATED: {
                bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
                dot: "bg-indigo-500",
            },
        };

        const current = styles[eventType] || {
            bg: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
            dot: "bg-zinc-400",
        };

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${current.bg}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
                {eventType}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-black p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Export Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                            <span>🛡️</span> Cryptographic Audit & Compliance Ledger
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Audit Trail & System Telemetry
                        </h1>
                        <p className="text-zinc-500 mt-1 text-sm">
                            Immutable records tracking autonomous agent executions, payment verifications, and catalog state changes.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>📥</span> Export JSON Ledger
                        </button>
                        <button
                            onClick={() => fetchLogs(true)}
                            disabled={isRefreshing}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                justRefreshed
                                    ? "bg-emerald-600 text-white dark:bg-emerald-500"
                                    : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
                            } ${isRefreshing ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            <span className={isRefreshing ? "animate-spin inline-block" : ""}>🔄</span>
                            <span>{isRefreshing ? "Syncing..." : justRefreshed ? "✓ Synced" : "Refresh Logs"}</span>
                        </button>
                    </div>
                </div>

                {/* 3 Compliance KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Total Audit Records
                        </span>
                        <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {metrics.total} <span className="text-xs font-medium text-zinc-400">Events</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            AI Agent Operations
                        </span>
                        <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                            {metrics.aiActions} <span className="text-xs font-medium text-zinc-400">Executions</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Payment Captures
                        </span>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {metrics.paymentEvents} <span className="text-xs font-medium text-zinc-400">Verified</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Toolbar Controls */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 text-sm">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search by event type, entity ID, or description..."
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

                    {/* Category Filter Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs overflow-x-auto">
                        {[
                            { id: "ALL", label: "All Logs" },
                            { id: "AI", label: "🤖 AI Executions" },
                            { id: "PAYMENTS", label: "💳 Payments" },
                            { id: "MARKETING", label: "📢 Campaigns & Bundles" },
                            { id: "INVENTORY", label: "📦 Inventory" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setCategoryFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                                    categoryFilter === tab.id
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Audit Ledger Data Table */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 w-20">Log ID</th>
                                    <th className="py-3.5 px-4">Event Classification</th>
                                    <th className="py-3.5 px-4">Entity Scope</th>
                                    <th className="py-3.5 px-4">Operation Description</th>
                                    <th className="py-3.5 px-4 text-right">Timestamp (IST)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-zinc-500">
                                            Loading compliance audit trail...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-zinc-500">
                                            No matching audit records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition"
                                        >
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => handleCopyId(log.id)}
                                                    className="font-mono text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer flex items-center gap-1"
                                                    title="Click to copy Log ID"
                                                >
                                                    <span>#{log.id}</span>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {copiedId === log.id ? "✓" : "📋"}
                                                    </span>
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getEventBadge(log.event_type)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                    {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-zinc-800 dark:text-zinc-200 font-medium max-w-md">
                                                {log.description || "—"}
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                                                {formatISTDateTime(log.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}