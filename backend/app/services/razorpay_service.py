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


def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except Exception as e:
        print("Signature verification failed:", e)
        return False

def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
):
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )

        return True

    except Exception:
        return False