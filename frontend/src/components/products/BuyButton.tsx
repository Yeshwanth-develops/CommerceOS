"use client";

import { useState } from "react";
import { buyProduct } from "@/lib/checkout";
import API_URL from "@/lib/api";
import PaymentModal, { PaymentSuccessData } from "@/components/PaymentModal";
import { useToast } from "@/components/Toast";

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
    const [successModalData, setSuccessModalData] = useState<PaymentSuccessData | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const { showToast } = useToast();

    const isOutOfStock = stock <= 0;

    const handleBuy = async () => {
        if (isOutOfStock) {
            showToast("Out of Stock", "This product is currently out of stock.", "warning");
            return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
            showToast("Initializing Gateway", "Loading secure Razorpay checkout...", "info");
            return;
        }

        try {
            setLoading(true);
            const order = await buyProduct(productId, merchantId, 1);

            if (!order || !order.razorpay_order_id) {
                throw new Error(order?.detail || "Failed to initialize order");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TSRpCbrCZNWuP2",
                amount: Math.round(order.amount * 100),
                currency: "INR",
                name: "ARGOS Commerce OS",
                description: title,
                order_id: order.razorpay_order_id,
                theme: {
                    color: "#09090b",
                },
                handler: async function (response: any) {
                    try {
                        const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
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
                            setSuccessModalData({
                                title,
                                amount: order.amount,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                            });
                            setIsSuccessModalOpen(true);
                            showToast("Payment Verified!", `Captured ₹${order.amount.toLocaleString()} for ${title}`, "success");
                            if (onPaymentSuccess) {
                                onPaymentSuccess();
                            }
                        } else {
                            showToast("Verification Failed", "Payment could not be verified by backend.", "error");
                        }
                    } catch (verifyErr: any) {
                        console.error("Verification error:", verifyErr);
                        showToast("Verification Error", verifyErr.message || "Failed to confirm payment signature.", "error");
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
                showToast("Payment Failed", response.error?.description || "Transaction was cancelled or declined.", "error");
            });

            razorpay.open();
        } catch (err: any) {
            console.error("Checkout error:", err);
            showToast("Checkout Error", err.message || "Failed to initiate payment.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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

            {/* High-End Payment Success Receipt Modal */}
            <PaymentModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                data={successModalData}
            />
        </>
    );
}