"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatISTDateTime } from "@/lib/dateUtils";
import API_URL from "@/lib/api";

interface Order {
    id: number;
    merchant_id: number;
    product_id: number;
    quantity: number;
    total_amount: number;
    status: string;
    razorpay_order_id?: string;
    created_at?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/orders/`);
            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Computed metrics
    const totalPaidRevenue = useMemo(() => {
        return orders
            .filter((o) => o.status === "PAID")
            .reduce((acc, o) => acc + o.total_amount, 0);
    }, [orders]);

    const paidCount = useMemo(() => {
        return orders.filter((o) => o.status === "PAID").length;
    }, [orders]);

    const failedCount = useMemo(() => {
        return orders.filter((o) => o.status === "FAILED").length;
    }, [orders]);

    const pendingCount = useMemo(() => {
        return orders.filter((o) => o.status === "PENDING").length;
    }, [orders]);

    const successRate = useMemo(() => {
        return orders.length > 0 ? Math.round((paidCount / orders.length) * 100) : 100;
    }, [orders, paidCount]);

    const filteredOrders = useMemo(() => {
        let list = [...orders];

        if (statusFilter !== "ALL") {
            list = list.filter((o) => o.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (o) =>
                    o.id.toString().includes(q) ||
                    o.product_id.toString().includes(q) ||
                    (o.razorpay_order_id && o.razorpay_order_id.toLowerCase().includes(q))
            );
        }

        return list;
    }, [orders, statusFilter, search]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            "PAID": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
            "PENDING": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            "FAILED": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
            "REFUNDED": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        };

        const currentStyle =
            styles[status] ||
            "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${status === "PAID" ? "bg-emerald-500" : status === "FAILED" ? "bg-rose-500" : "bg-amber-500"}`}></span>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-black p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                            <span>💳</span> Transaction Ledger & Gateway
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Orders & Payments
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Track real-time orders, payment statuses, and Razorpay transactions.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchOrders()}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                        <span>🔄</span> Refresh Orders
                    </button>
                </div>

                {/* 4-Metric Order KPI Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Total Orders
                        </span>
                        <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {orders.length}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Settled Revenue
                        </span>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹{totalPaidRevenue.toLocaleString("en-IN")}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Payment Success Rate
                        </span>
                        <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                            {successRate}% <span className="text-xs font-medium text-zinc-400">({paidCount} paid)</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Failed / Pending
                        </span>
                        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                            {failedCount} <span className="text-xs font-medium text-zinc-400">failed / {pendingCount} pending</span>
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
                            placeholder="Filter by Order ID or Razorpay Order ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs overflow-x-auto">
                        {["ALL", "PAID", "PENDING", "FAILED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                                    statusFilter === status
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                            >
                                {status === "ALL" ? "All Orders" : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Data Table */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 w-20">Order ID</th>
                                    <th className="py-3.5 px-4">Product ID</th>
                                    <th className="py-3.5 px-4">Qty</th>
                                    <th className="py-3.5 px-4">Total Amount</th>
                                    <th className="py-3.5 px-4">Payment Status</th>
                                    <th className="py-3.5 px-4">Gateway Reference</th>
                                    <th className="py-3.5 px-4 text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {loading && orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-zinc-500">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-zinc-500">
                                            No matching orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition"
                                        >
                                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                                #{order.id}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                                                Product #{order.product_id}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                                                {order.quantity}x
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-zinc-900 dark:text-zinc-100">
                                                ₹{order.total_amount.toLocaleString("en-IN")}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                                                {order.razorpay_order_id || "—"}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-[11px] text-zinc-400 font-medium">
                                                {formatISTDateTime(order.created_at)}
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