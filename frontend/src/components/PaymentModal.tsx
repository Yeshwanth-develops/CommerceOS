"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatISTDateTime } from "@/lib/dateUtils";

export interface PaymentSuccessData {
    title: string;
    amount: number;
    paymentId: string;
    orderId: string;
    timestamp?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: PaymentSuccessData | null;
}

export default function PaymentModal({ isOpen, onClose, data }: Props) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200">
                {/* Background decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

                {/* Animated Success Badge */}
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
                        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 duration-1000" />
                        <svg className="w-10 h-10 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Razorpay Settlement Captured
                    </div>

                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Payment Verified!
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Your transaction has been confirmed and recorded on the immutable store ledger.
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="mt-6 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                        <span className="text-zinc-500 dark:text-zinc-400">Purchased Item</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate text-right">
                            {data.title}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                        <span className="text-zinc-500 dark:text-zinc-400">Total Amount</span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{data.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                        <span className="text-zinc-500 dark:text-zinc-400">Payment ID</span>
                        <span className="font-mono text-[11px] bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200">
                            {data.paymentId}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Order ID</span>
                        <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[180px]">
                            {data.orderId}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                    <Link
                        href="/orders"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-xs tracking-wide text-center transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                        <span>View in Orders Ledger</span>
                        <span>→</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="py-3 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
