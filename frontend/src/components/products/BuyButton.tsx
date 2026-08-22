"use client";

import { useState } from "react";
import { buyProduct } from "@/lib/checkout";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Props {
    productId: number;
    merchantId?: number;
    title: string;
    stock?: number;
    onPaymentSuccess?: () => void;
}

export default function BuyButton({
    productId,
    merchantId = 1,
    title,
    stock = 1,
    onPaymentSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);

    const isOutOfStock = stock <= 0;

    const handleBuy = async () => {
        if (isOutOfStock) {
            alert("This item is currently out of stock.");
            return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
            alert("Razorpay checkout is loading. Please try again in a few seconds.");
            return;
        }

        try {
            setLoading(true);
            const order = await buyProduct(productId, merchantId, 1);

            if (!order || !order.razorpay_order_id) {
                throw new Error(order?.detail || "Failed to initialize order");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(order.amount * 100),
                currency: "INR",
                name: "ARGOS",
                description: title,
                order_id: order.razorpay_order_id,
                theme: {
                    color: "#000000",
                },
                handler: async function (response: any) {
                    try {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                        const verifyResponse = await fetch(`${baseUrl}/payments/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const result = await verifyResponse.json();

                        if (result.success) {
                            alert("Payment Verified");
                            if (onPaymentSuccess) {
                                onPaymentSuccess();
                            }
                        } else {
                            alert("Payment verification failed");
                        }
                    } catch (verifyErr: any) {
                        console.error("Verification error:", verifyErr);
                        alert(`Verification request failed: ${verifyErr.message}`);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function (response: any) {
                console.error("Payment Failed:", response.error);
                alert(`Payment Failed: ${response.error.description || "Transaction failed"}`);
            });

            razorpay.open();
        } catch (err: any) {
            console.error("Checkout error:", err);
            alert(err.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuy}
            disabled={loading || isOutOfStock}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                isOutOfStock
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                    : "bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 active:scale-95"
            } disabled:opacity-60`}
        >
            {loading ? (
                <>
                    <span className="animate-spin text-xs">🔄</span>
                    <span>Opening...</span>
                </>
            ) : isOutOfStock ? (
                "Out of Stock"
            ) : (
                <>
                    <span>Buy Now</span>
                    <span>⚡</span>
                </>
            )}
        </button>
    );
}