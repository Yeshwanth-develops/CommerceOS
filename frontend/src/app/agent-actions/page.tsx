"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { formatISTDateTime, formatISTTimeOnly } from "@/lib/dateUtils";
import API_URL from "@/lib/api";

interface AgentAction {
    id: number;
    action_type: string;
    action_name: string;
    status: string;
    source_agent: string;
    created_at: string;
}

export default function AgentActionsPage() {
    const [actions, setActions] = useState<AgentAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [justRefreshed, setJustRefreshed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [selectedAgent, setSelectedAgent] = useState<string>("ALL");
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const fetchActions = useCallback(async (isManual: boolean = false) => {
        try {
            if (isManual) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            const res = await fetch(`${API_URL}/agent-actions/?_t=${Date.now()}`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error("Failed to fetch agent actions");
            const data = await res.json();
            setActions(data);
            if (isManual) {
                setJustRefreshed(true);
                setTimeout(() => setJustRefreshed(false), 1500);
            }
        } catch (err) {
            console.error("Error fetching agent actions:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchActions(false);
    }, [fetchActions]);

    const handleCopyId = (id: number) => {
        navigator.clipboard.writeText(`ACTION-#${id}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // Filtered Actions
    const filteredActions = useMemo(() => {
        return actions.filter((item) => {
            const matchesSearch =
                item.action_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.source_agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toString().includes(searchTerm);

            const matchesStatus =
                selectedStatus === "ALL" ||
                item.status.toUpperCase() === selectedStatus.toUpperCase();

            const matchesAgent =
                selectedAgent === "ALL" ||
                item.source_agent.toLowerCase() === selectedAgent.toLowerCase();

            return matchesSearch && matchesStatus && matchesAgent;
        });
    }, [actions, searchTerm, selectedStatus, selectedAgent]);

    // Unique agents list for filter dropdown
    const uniqueAgents = useMemo(() => {
        const agents = new Set(actions.map((a) => a.source_agent));
        return Array.from(agents);
    }, [actions]);

    // Summary Metrics
    const metrics = useMemo(() => {
        const total = actions.length;
        const completed = actions.filter((a) => a.status.toUpperCase() === "COMPLETED").length;
        const running = actions.filter((a) => a.status.toUpperCase() === "RUNNING").length;
        const failed = actions.filter((a) => a.status.toUpperCase() === "FAILED").length;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;
        const latest = actions.length > 0 ? actions[0] : null;

        return { total, completed, running, failed, successRate, latest };
    }, [actions]);

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Completed
                    </span>
                );
            case "RUNNING":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                        Running
                    </span>
                );
            case "FAILED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Failed
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
                        {status}
                    </span>
                );
        }
    };

    const getAgentBadge = (agent: string) => {
        const ag = agent.toLowerCase();
        if (ag.includes("campaign")) {
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        }
        if (ag.includes("bundle")) {
            return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
        }
        if (ag.includes("growth")) {
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
        }
        if (ag.includes("inventory")) {
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
        }
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-black p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
                            <span>⚡</span> Execution Center
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Agent Execution Center
                        </h1>
                        <p className="text-zinc-500 mt-1 text-sm">
                            Live telemetry and execution logs for AI autonomous agents across ARGOS.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/growth"
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-xs flex items-center gap-1.5"
                        >
                            Open Growth AI Copilot →
                        </Link>
                        <button
                            onClick={() => fetchActions(true)}
                            disabled={isRefreshing}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                justRefreshed
                                    ? "bg-emerald-600 text-white dark:bg-emerald-500"
                                    : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
                            } ${isRefreshing ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            <span className={isRefreshing ? "animate-spin inline-block" : ""}>🔄</span>
                            <span>{isRefreshing ? "Syncing..." : justRefreshed ? "✓ Synced" : "Refresh Actions"}</span>
                        </button>
                    </div>
                </div>

                {/* 4 Telemetry Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Total Executions
                        </span>
                        <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {metrics.total}
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block">
                            All recorded autonomous actions
                        </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Success Rate
                        </span>
                        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {metrics.successRate}%
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block">
                            {metrics.completed} of {metrics.total} completed successfully
                        </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Active Agents
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            {uniqueAgents.length || 5}
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block">
                            Campaign, Bundle & Growth Copilots
                        </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Latest Execution
                        </span>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                            {metrics.latest ? metrics.latest.action_name : "No actions yet"}
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block font-mono">
                            {metrics.latest ? formatISTTimeOnly(metrics.latest.created_at) + " IST" : "Idle"}
                        </span>
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
                            placeholder="Search by action name, agent, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="RUNNING">Running</option>
                            <option value="FAILED">Failed</option>
                            <option value="PENDING">Pending</option>
                        </select>

                        {/* Agent Filter */}
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                        >
                            <option value="ALL">All Agents</option>
                            {uniqueAgents.map((agent) => (
                                <option key={agent} value={agent}>
                                    {agent}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Agent Actions Table */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 w-16">ID</th>
                                    <th className="py-3.5 px-4">Source Agent</th>
                                    <th className="py-3.5 px-4">Action Classification</th>
                                    <th className="py-3.5 px-4">Action Details</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Timestamp (IST)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {loading && actions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-zinc-500">
                                            Loading agent execution telemetry...
                                        </td>
                                    </tr>
                                ) : filteredActions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-zinc-500">
                                            No matching agent actions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredActions.map((action) => (
                                        <tr
                                            key={action.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition"
                                        >
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => handleCopyId(action.id)}
                                                    className="font-mono text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer flex items-center gap-1"
                                                    title="Click to copy ID"
                                                >
                                                    <span>#{action.id}</span>
                                                    <span className="text-[10px] text-zinc-400">
                                                        {copiedId === action.id ? "✓" : "📋"}
                                                    </span>
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getAgentBadge(
                                                        action.source_agent
                                                    )}`}
                                                >
                                                    {action.source_agent}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                    {action.action_type}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100 max-w-md">
                                                {action.action_name}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(action.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                                                {formatISTDateTime(action.created_at)}
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
