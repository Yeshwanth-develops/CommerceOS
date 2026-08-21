import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID", "").strip(),
        os.getenv("RAZORPAY_KEY_SECRET", "").strip(),
    )
)


def create_razorpay_order(amount: float):
    data = {
        "amount": int(amount * 100),  # convert ₹ to paise
        "currency": "INR",
        "receipt": "commerceos_receipt",
    }
    return client.order.create(data=data)


def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )
        return True
    except Exception as e:
        print("Payment signature verification failed:", e)
        return False


# Alias for backward compatibility
verify_razorpay_signature = verify_payment_signature


def verify_webhook_signature(
    body: str,
    signature: str,
    webhook_secret: str,
) -> bool:
    try:
        client.utility.verify_webhook_signature(
            body,
            signature,
            webhook_secret,
        )
        return True
    except Exception as e:
        print("Webhook signature verification failed:", e)
        return False