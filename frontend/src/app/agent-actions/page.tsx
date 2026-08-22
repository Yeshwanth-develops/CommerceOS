"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [selectedAgent, setSelectedAgent] = useState<string>("ALL");

    const fetchActions = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/agent-actions/`);
            if (!res.ok) throw new Error("Failed to fetch agent actions");
            const data = await res.json();
            setActions(data);
        } catch (err) {
            console.error("Error fetching agent actions:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchActions();
    };

    // Filtered Actions
    const filteredActions = useMemo(() => {
        return actions.filter((item) => {
            const matchesSearch =
                item.action_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.source_agent.toLowerCase().includes(searchTerm.toLowerCase());

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
        const pending = actions.filter((a) => a.status.toUpperCase() === "PENDING").length;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

        return { total, completed, running, failed, pending, successRate };
    }, [actions]);

    // Status Styling: Completed -> Green, Running -> Blue, Failed -> Red, Pending -> Orange
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
        if (agent.toLowerCase().includes("campaign")) {
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
        }
        if (agent.toLowerCase().includes("bundle")) {
            return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
        }
        if (agent.toLowerCase().includes("growth")) {
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
        }
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
                            <span>⚡</span> Execution Center
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            Agent Execution Center
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Live telemetry and execution logs for AI autonomous agents across CommerceOS.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/growth"
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            Open Growth AI Copilot →
                        </Link>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {refreshing ? "Refreshing..." : "Refresh Actions ↺"}
                        </button>
                    </div>
                </div>

                {/* Telemetry Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Active Agents
                        </span>
                        <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            {uniqueAgents.length || 3}
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block">
                            Campaign, Bundle & Growth Copilots
                        </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Latest Execution
                        </span>
                        <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2 truncate">
                            {actions.length > 0 ? actions[0].action_name : "No actions yet"}
                        </div>
                        <span className="text-xs text-zinc-400 mt-1 block truncate">
                            {actions.length > 0 ? new Date(actions[0].created_at).toLocaleTimeString("en-IN") : "Idle"}
                        </span>
                    </div>
                </div>

                {/* Filters & Table Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    {/* Filter Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="Search by action name, agent, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Status Filter */}
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-zinc-400 text-xs">Status:</span>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="COMPLETED">Completed (Green)</option>
                                    <option value="RUNNING">Running (Blue)</option>
                                    <option value="FAILED">Failed (Red)</option>
                                    <option value="PENDING">Pending (Orange)</option>
                                </select>
                            </div>

                            {/* Agent Filter */}
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-zinc-400 text-xs">Agent:</span>
                                <select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
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
                    </div>

                    {/* Table */}
                    {loading && actions.length === 0 ? (
                        <div className="py-16 text-center text-sm text-zinc-500 animate-pulse">
                            Loading agent execution telemetry...
                        </div>
                    ) : filteredActions.length === 0 ? (
                        <div className="py-16 text-center text-sm text-zinc-500 space-y-2">
                            <p>No agent actions match the filter criteria.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedStatus("ALL");
                                    setSelectedAgent("ALL");
                                }}
                                className="text-xs underline text-zinc-800 dark:text-zinc-200"
                            >
                                Reset filters
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                                        <TableHead className="w-16 text-xs font-semibold">ID</TableHead>
                                        <TableHead className="text-xs font-semibold">Source Agent</TableHead>
                                        <TableHead className="text-xs font-semibold">Action Type</TableHead>
                                        <TableHead className="text-xs font-semibold">Action Details</TableHead>
                                        <TableHead className="text-xs font-semibold">Status</TableHead>
                                        <TableHead className="text-xs font-semibold text-right">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredActions.map((action) => (
                                        <TableRow
                                            key={action.id}
                                            className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition"
                                        >
                                            <TableCell className="font-mono text-xs text-zinc-400">
                                                #{action.id}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getAgentBadge(
                                                        action.source_agent
                                                    )}`}
                                                >
                                                    {action.source_agent}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                    {action.action_type}
                                                </span>
                                            </TableCell>

                                            <TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-100 max-w-md">
                                                {action.action_name}
                                            </TableCell>

                                            <TableCell>
                                                {getStatusBadge(action.status)}
                                            </TableCell>

                                            <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 text-right whitespace-nowrap">
                                                {new Date(action.created_at).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
