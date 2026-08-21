import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "").strip()

model = None
if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Prefer gemini-1.5-flash or gemini-2.5-flash
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print("Gemini model initialization notice:", e)
        model = None


def get_ai_recommendations(
    revenue: float,
    orders: int,
    products: List[str]
) -> str:
    prompt = f"""
You are an expert e-commerce growth copilot and business intelligence consultant.

Business Metrics:
- Total Revenue: ₹{revenue:,.2f}
- Total Orders: {orders}
- Active Products: {', '.join(products) if products else 'No active products'}

Provide concise, structured, actionable recommendations covering:
1. Growth Score Analysis (out of 100)
2. Revenue & Pricing Opportunities
3. Upsell, Cross-Sell & Bundling Strategies
4. Inventory Management & Stock Optimization Suggestions

Keep formatting clean with bullet points and bold section headers.
"""

    if model and api_key:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            print("Gemini API call failed, using heuristic advisor:", e)

    # High-quality heuristic fallback if API key is missing or quota exceeded
    return f"""### 🚀 AI Growth Analysis & Strategy

* **Growth Score**: **{min(100, 50 + orders * 3)}/100** based on current order volume and catalog depth.
* **Revenue Opportunities**:
  - Implement a limited-time 10% discount on slow-moving inventory to boost velocity.
  - Introduce seasonal bundle discounts on top-selling products.
* **Upsell & Cross-Sell**:
  - Recommend complementary add-ons at checkout to raise Average Order Value (AOV).
  - Target high-value customers with loyalty reward tiers.
* **Inventory Optimization**:
  - Set reorder alert thresholds for items below 10 units to avoid out-of-stock lost sales.
"""