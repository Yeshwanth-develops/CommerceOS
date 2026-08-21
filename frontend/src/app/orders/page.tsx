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

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/orders/`);
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
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            Orders
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Track real-time orders, payment statuses, and Razorpay transactions.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchOrders()}
                        className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        Refresh Orders
                    </button>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableHead className="w-[80px]">Order ID</TableHead>
                                <TableHead>Product ID</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Razorpay ID</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && orders.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-zinc-500"
                                    >
                                        Loading orders...
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-zinc-500"
                                    >
                                        No orders placed yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs text-zinc-500">
                                            #{order.id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            Product #{order.product_id}
                                        </TableCell>
                                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                                            {order.quantity}
                                        </TableCell>
                                        <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            ₹{order.total_amount.toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-zinc-500">
                                            {order.razorpay_order_id || "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-zinc-500">
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleString("en-IN", {
                                                      dateStyle: "short",
                                                      timeStyle: "short",
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