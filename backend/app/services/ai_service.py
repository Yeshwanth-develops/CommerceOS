import os
import json
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "").strip()

model = None
if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Use active Gemini flash model
        model = genai.GenerativeModel("gemini-3.6-flash")
    except Exception as e:
        print("Gemini model initialization notice:", e)
        model = None


def get_ai_recommendations(
    revenue: float,
    orders: int,
    products: List[str],
    growth_score: int
) -> str:
    prompt = f"""
You are an expert e-commerce growth copilot and business intelligence consultant.

Current Store Metrics:
- Calculated Store Growth Score: {growth_score}/100
- Total Revenue: ₹{revenue:,.2f}
- Total Orders: {orders}
- Active Products: {', '.join(products) if products else 'No active products'}

Provide a clean, structured, actionable strategic growth briefing covering:
1. Growth Score Analysis ({growth_score}/100): Analyze why the store has an exact Growth Score of {growth_score}/100 based on current order volume ({orders} orders) and revenue traction (₹{revenue:,.2f}). Do NOT calculate or mention any other score number.
2. Revenue & Pricing Opportunities: 2-3 high-impact pricing and discount tactics.
3. Upsell, Cross-Sell & Bundling Strategies: High-converting pairing ideas.
4. Inventory Management & Stock Optimization: Stock health and reorder priorities.

Formatting instructions:
- Use clear headers for each section (e.g. '### 1. Growth Score Analysis ({growth_score}/100)').
- Use bullet points with bold subheadings for readability.
- Do NOT output loose separator lines like '---'.
"""

    if model and api_key:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            print("Gemini API call failed, using heuristic advisor:", e)

    # Heuristic fallback
    return f"""### 1. Growth Score Analysis ({growth_score}/100)
* **Score Evaluation**: **{growth_score}/100** driven by healthy order throughput ({orders} orders) and steady catalog performance.
* **Core Strength**: Consistent revenue generation (₹{revenue:,.2f}).

### 2. Revenue & Pricing Opportunities
* **Promotional Push**: Implement a limited-time 10% discount on slow-moving inventory to boost velocity.
* **Volume Bundling**: Introduce seasonal bundle discounts on top-selling products.

### 3. Upsell & Cross-Sell Strategies
* **Checkout Add-ons**: Recommend complementary peripherals at checkout to raise Average Order Value (AOV).
* **Customer Tiers**: Target high-value customers with loyalty reward tiers.

### 4. Inventory Optimization
* **Safety Threshold**: Set reorder alert thresholds for items below 10 units to avoid out-of-stock lost sales.
"""


def generate_gemini_bundle(
    products: List[Dict[str, Any]],
    total_orders: int,
    total_revenue: float
) -> Dict[str, Any]:
    """
    Finds the best bundle opportunities using Gemini AI.
    Inputs: Products, Orders, Revenue.
    Returns: Bundle Name, Products, Bundle Price, Expected AOV Increase, Reasoning.
    """
    product_lines = "\n".join([
        f"- {p['title']} (Price: ₹{p['price']:,.2f}, Stock: {p.get('stock', 0)})"
        for p in products
    ])

    prompt = f"""You are a world-class AI eCommerce Merchandising Specialist.
Analyze the following store catalog and order performance metrics to find the single best bundle opportunity that maximizes Average Order Value (AOV) and customer conversion.

Store Metrics:
- Total Revenue: ₹{total_revenue:,.2f}
- Total Orders: {total_orders}

Catalog Products:
{product_lines}

Instructions:
Find the best bundle opportunity pairing complementary products (e.g. anchor item + high-margin accessory or complementary item).
Compute an attractive bundle price (typically 10-15% discount off the sum of individual prices).
Estimate the realistic percentage increase in Average Order Value (AOV).
Provide compelling commercial reasoning.

Respond ONLY with a valid JSON object in this exact schema without any markdown wrapping or text before/after:
{{
  "bundle_name": "Name of the Bundle",
  "product_1": "Exact title of first product from catalog",
  "product_2": "Exact title of second product from catalog",
  "bundle_price": 77579.0,
  "expected_aov_increase": 18.0,
  "reasoning": "Clear explanation of why these two products synergize to lift average basket size and conversion rate."
}}
"""

    if model and api_key and len(products) >= 2:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                text = response.text.strip()
                # Clean codeblock fences if present
                if text.startswith("```"):
                    text = re.sub(r"^```(?:json)?\s*", "", text)
                    text = re.sub(r"\s*```$", "", text)
                
                parsed = json.loads(text.strip())

                # Clean numeric values if strings (e.g. '18%' -> 18.0)
                aov_raw = parsed.get("expected_aov_increase", 18.0)
                if isinstance(aov_raw, str):
                    aov_raw = float(re.sub(r"[^\d.]", "", aov_raw) or 18.0)
                else:
                    aov_raw = float(aov_raw)

                price_raw = parsed.get("bundle_price", 0.0)
                if isinstance(price_raw, str):
                    price_raw = float(re.sub(r"[^\d.]", "", price_raw) or 0.0)
                else:
                    price_raw = float(price_raw)

                # Ensure product names are valid strings from catalog
                p1_name = str(parsed.get("product_1", products[0]["title"]))
                p2_name = str(parsed.get("product_2", products[1]["title"]))

                # If bundle_price is 0 or unrealistic, fallback to 90% of sum
                if price_raw <= 0:
                    sum_price = next((p['price'] for p in products if p['title'] == p1_name), products[0]['price']) + \
                                next((p['price'] for p in products if p['title'] == p2_name), products[1]['price'])
                    price_raw = round(sum_price * 0.9, 2)

                return {
                    "bundle_name": parsed.get("bundle_name", f"{p1_name} + {p2_name}"),
                    "product_1": p1_name,
                    "product_2": p2_name,
                    "bundle_price": round(price_raw, 2),
                    "expected_aov_increase": round(aov_raw, 1),
                    "reasoning": parsed.get("reasoning", "Complementary product pairing strategically designed to increase basket value.")
                }
        except Exception as e:
            print("Gemini Bundle Generation Error, using fallback heuristic:", e)

    # Heuristic fallback if Gemini API is offline
    p1 = products[0]
    p2 = products[1] if len(products) > 1 else products[0]
    sum_price = p1["price"] + p2["price"]
    bundle_price = round(sum_price * 0.9, 2)

    return {
        "bundle_name": f"{p1['title']} + {p2['title']}",
        "product_1": p1["title"],
        "product_2": p2["title"],
        "bundle_price": bundle_price,
        "expected_aov_increase": 18.0,
        "reasoning": f"Heuristic pairing of top-tier catalog items '{p1['title']}' and '{p2['title']}' with 10% bundle incentive to lift average order value."
    }