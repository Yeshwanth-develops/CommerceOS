"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/audit/`);
            if (!res.ok) throw new Error("Failed to fetch audit logs");
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getEventBadge = (eventType: string) => {
        const styles: Record<string, string> = {
            PAYMENT_VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
            ORDER_CREATED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
            PRODUCT_CREATED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
            PRODUCT_UPDATED: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
            PAYMENT_FAILED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
            REFUND_CREATED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
            AI_RECOMMENDATION: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            CAMPAIGN_GENERATED: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
            AI_CAMPAIGN_CREATED: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-400 dark:border-fuchsia-800",
            AI_BUNDLE_CREATED: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
            CAMPAIGN_STATUS_UPDATED: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
            BUNDLE_STATUS_UPDATED: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
        };

        const currentStyle =
            styles[eventType] ||
            "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${currentStyle}`}
            >
                {eventType}
            </span>
        );
    };

    const filteredLogs = logs.filter((log) => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return (
            log.event_type.toLowerCase().includes(q) ||
            log.entity_type.toLowerCase().includes(q) ||
            (log.description && log.description.toLowerCase().includes(q))
        );
    });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            Audit Trail & System Logs
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Immutable audit records tracking product creation, orders, payments, webhooks, and AI events.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Filter events or entities..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3.5 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        <button
                            onClick={() => fetchLogs()}
                            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableHead className="w-[80px]">Log ID</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && logs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-zinc-500"
                                    >
                                        Loading audit trail...
                                    </TableCell>
                                </TableRow>
                            ) : filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-zinc-500"
                                    >
                                        No audit records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs text-zinc-500">
                                            #{log.id}
                                        </TableCell>
                                        <TableCell>
                                            {getEventBadge(log.event_type)}
                                        </TableCell>
                                        <TableCell className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] font-mono">
                                                {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-zinc-800 dark:text-zinc-200">
                                            {log.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-zinc-500 whitespace-nowrap">
                                            {log.created_at
                                                ? new Date(log.created_at).toLocaleString("en-IN", {
                                                      dateStyle: "short",
                                                      timeStyle: "medium",
                                                  })
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}