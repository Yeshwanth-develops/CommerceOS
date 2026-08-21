from app.services.razorpay_service import create_razorpay_order

order = create_razorpay_order(999)

print(order)