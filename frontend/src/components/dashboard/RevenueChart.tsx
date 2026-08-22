"use client";

import { useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface OrderData {
    id: number;
    total_amount: number;
    status: string;
    created_at?: string;
}

interface RevenueChartProps {
    orders?: OrderData[];
    totalRevenue?: number;
}

export default function RevenueChart({ orders = [], totalRevenue = 0 }: RevenueChartProps) {
    const [viewType, setViewType] = useState<"daily" | "cumulative">("daily");

    // Aggregate live orders by day over the last 30 days
    const chartData = useMemo(() => {
        const daysMap: Record<string, { date: string; displayDate: string; daily: number; count: number }> = {};
        const now = new Date();

        // Initialize 30 calendar days leading up to today
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split("T")[0];
            const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            daysMap[key] = { date: key, displayDate, daily: 0, count: 0 };
        }

        const paidOrders = orders.filter((o) => (o.status || "").toUpperCase() === "PAID");

        if (paidOrders.length > 0) {
            paidOrders.forEach((o) => {
                if (o.created_at) {
                    const key = o.created_at.split("T")[0];
                    if (daysMap[key]) {
                        daysMap[key].daily += o.total_amount;
                        daysMap[key].count += 1;
                    }
                }
            });
        }

        // Compute running cumulative total
        let runningTotal = 0;
        return Object.values(daysMap).map((item) => {
            runningTotal += item.daily;
            return {
                ...item,
                cumulative: runningTotal,
            };
        });
    }, [orders]);

    const statsSummary = useMemo(() => {
        if (!chartData || chartData.length === 0) return { peak: 0, avg: 0, liveTotal: 0 };
        const maxDaily = Math.max(...chartData.map((d) => d.daily));
        const total = chartData.reduce((acc, d) => acc + d.daily, 0);
        const activeDays = chartData.filter((d) => d.daily > 0).length || 1;
        const avg = Math.round(total / activeDays);
        return { peak: maxDaily, avg, liveTotal: total };
    }, [chartData]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1">
                        <span>{data.displayDate}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                            {data.count} order{data.count !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 block">
                            {viewType === "daily" ? "Daily Revenue" : "Cumulative Revenue"}
                        </span>
                        <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                            ₹{(payload[0].value || 0).toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Financial Telemetry
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Telemetry (30 Days)
                        </span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-2">
                        <span>📈</span> Revenue Trend & Growth Velocity
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Metric Badges */}
                    <div className="hidden sm:flex items-center gap-3 pr-2 text-xs text-zinc-500 border-r border-zinc-200 dark:border-zinc-800">
                        <div>
                            <span className="text-[10px] text-zinc-400 block">Peak Day</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                ₹{statsSummary.peak.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-zinc-400 block">Active Daily Avg</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                ₹{statsSummary.avg.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                        <button
                            onClick={() => setViewType("daily")}
                            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                                viewType === "daily"
                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setViewType("cumulative")}
                            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                                viewType === "cumulative"
                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                        >
                            Cumulative
                        </button>
                    </div>
                </div>
            </div>

            {/* Recharts Area Container */}
            <div className="w-full h-72 sm:h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e4e4e7"
                            className="dark:opacity-15"
                        />
                        <XAxis
                            dataKey="displayDate"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#a1a1aa" }}
                            interval={3}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "#a1a1aa" }}
                            tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000).toFixed(1) + "L" : (val / 1000).toFixed(0) + "k"}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={viewType === "daily" ? "daily" : "cumulative"}
                            stroke={viewType === "daily" ? "#9333ea" : "#06b6d4"}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill={`url(#${viewType === "daily" ? "revenueGradient" : "cumulativeGradient"})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
