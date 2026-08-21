export async function buyProduct(
    productId: number,
    merchantId: number,
    quantity: number = 1
) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${baseUrl}/orders/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            merchant_id: merchantId,
            product_id: productId,
            quantity,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "Failed to create order");
    }

    return data;
}

export async function verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${baseUrl}/payments/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || "Payment verification failed");
    }

    return data;
}