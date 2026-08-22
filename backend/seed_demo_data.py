import random
from datetime import datetime, timedelta
from app.db.database import SessionLocal
from app.models.merchant import Merchant
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.campaign import Campaign
from app.models.bundle import Bundle
from app.models.agent_action import AgentAction
from app.models.audit_log import AuditLog
from app.constants.campaign_status import CampaignStatus
from app.constants.bundle_status import BundleStatus
from app.constants.events import Events

def seed_demo_data():
    db = SessionLocal()
    print("[*] Seeding Demo Data...")

    # 1. Ensure Merchant
    merchant = db.query(Merchant).first()
    if not merchant:
        merchant = Merchant(id=1, name="Apex Retail Technologies", email="founder@apexretail.io")
        db.add(merchant)
        db.commit()
        db.refresh(merchant)

    # 2. Seed Categories
    category_names = ["Computers & Laptops", "Audio & Headphones", "Peripherals & Accessories", "Mobile & Tablets", "Office & Ergonomics"]
    categories = {}
    for cname in category_names:
        cat = db.query(Category).filter(Category.name == cname).first()
        if not cat:
            cat = Category(name=cname)
            db.add(cat)
            db.commit()
            db.refresh(cat)
        categories[cname] = cat

    # Clear previous demo items to maintain exact counts
    db.query(Order).delete()
    db.query(Campaign).delete()
    db.query(Bundle).delete()
    db.query(Product).delete()
    db.query(AgentAction).delete()
    db.query(AuditLog).delete()
    db.commit()

    # 3. Seed Exactly 20 Products
    products_catalog = [
        ("HP Pavilion Gaming Laptop", "High performance Ryzen 7 gaming laptop with 16GB RAM and RTX 3050 graphics.", 65000.0, 18, "Computers & Laptops"),
        ("Logitech MX Master 3S Wireless Mouse", "Ultrafast Quiet Click ergonomic mouse for master productivity.", 8995.0, 42, "Peripherals & Accessories"),
        ("Sony WH-1000XM5 Wireless Headphones", "Industry-leading noise canceling wireless headphones with 30hr battery.", 26990.0, 25, "Audio & Headphones"),
        ("Mechanical Gaming Keyboard RGB", "Hot-swappable tactile switches with customizable per-key RGB backlighting.", 4500.0, 35, "Peripherals & Accessories"),
        ("Dell UltraSharp 27\" 4K Monitor", "IPS Black panel 4K monitor with 98% DCI-P3 color accuracy and USB-C hub.", 38500.0, 12, "Computers & Laptops"),
        ("Apple iPad Air 11-inch M2", "Ultra-fast Apple M2 chip with Liquid Retina display and 128GB storage.", 59900.0, 16, "Mobile & Tablets"),
        ("Apple Pencil Pro", "Pixel-perfect precision with barrel roll, squeeze gestures, and haptic feedback.", 11900.0, 28, "Mobile & Tablets"),
        ("Samsung Galaxy Watch 6", "Advanced health tracking, personalized sleep coaching, and sapphire glass.", 19999.0, 22, "Mobile & Tablets"),
        ("Anker 737 Power Bank 24,000mAh", "140W ultra-fast charging power bank with smart digital display.", 12499.0, 30, "Peripherals & Accessories"),
        ("USB-C 7-in-1 Dual Display Hub", "Aluminum multi-port adapter with 4K HDMI, 100W PD, and SD card reader.", 3299.0, 60, "Peripherals & Accessories"),
        ("Ergonomic Mesh Office Chair", "Adjustable lumbar support, 3D armrests, and breathable breathable mesh.", 14999.0, 14, "Office & Ergonomics"),
        ("Blue Yeti USB Condenser Microphone", "Broadcast-quality USB microphone for podcasting, streaming, and voiceover.", 9990.0, 20, "Audio & Headphones"),
        ("Elgato Stream Deck MK.2", "15 customizable LCD keys to control streaming apps, tools, and lighting.", 13490.0, 15, "Peripherals & Accessories"),
        ("SanDisk Extreme 1TB Portable SSD", "Tough, water & dust resistant NVMe portable solid state drive.", 8799.0, 40, "Peripherals & Accessories"),
        ("Keychron K2 Wireless Mechanical Keyboard", "Compact 75% layout wireless Bluetooth keyboard for Mac & Windows.", 7499.0, 26, "Peripherals & Accessories"),
        ("Bose QuietComfort Ultra Earbuds", "Spatial audio with world-class noise cancellation and custom immersion.", 21900.0, 19, "Audio & Headphones"),
        ("Nanoleaf Lines Smart RGB Light Bars", "Modular smart backlit illumination bars with music sync.", 16499.0, 11, "Office & Ergonomics"),
        ("CalDigit TS4 Thunderbolt 4 Dock", "18-port Thunderbolt 4 workstation dock with 98W host charging.", 32999.0, 8, "Peripherals & Accessories"),
        ("Kindle Paperwhite 16GB", "6.8\" glare-free display with adjustable warm light and waterproof chassis.", 14999.0, 32, "Mobile & Tablets"),
        ("MagSafe 3-in-1 Fast Wireless Charger", "Simultaneous fast charging station for iPhone, Apple Watch, and AirPods.", 5999.0, 45, "Mobile & Tablets"),
    ]

    saved_products = []
    for title, desc, price, stock, cat_name in products_catalog:
        prod = Product(
            title=title,
            description=desc,
            price=price,
            stock=stock,
            merchant_id=merchant.id,
            category_id=categories[cat_name].id
        )
        db.add(prod)
        saved_products.append(prod)
    
    db.commit()
    for p in saved_products:
        db.refresh(p)
    print(f"[*] Seeded {len(saved_products)} Products")

    # 4. Seed Exactly 50 Orders (40 Paid, 5 Failed, 5 Pending)
    # 40 Paid
    # 5 Failed
    # 5 Pending
    order_statuses = (
        [(OrderStatus.PAID.value, "PAID")] * 40 +
        [(OrderStatus.FAILED.value, "FAILED")] * 5 +
        [(OrderStatus.PENDING.value, "PENDING")] * 5
    )

    saved_orders = []
    now = datetime.utcnow()

    # Distribute orders evenly across all 30 days (day -29 to day 0 today)
    for i, (status, pay_status) in enumerate(order_statuses):
        prod = random.choice(saved_products)
        qty = random.choice([1, 1, 1, 2])
        total = round(prod.price * qty, 2)
        
        # Calculate day offset smoothly across 30 days
        day_offset = int(29 - (i / len(order_statuses)) * 29)
        hour_offset = random.randint(8, 22)
        min_offset = random.randint(5, 55)
        order_date = now - timedelta(days=day_offset, hours=hour_offset, minutes=min_offset)
        
        rzp_order_id = f"order_demo_{1001 + i}"
        
        ord_obj = Order(
            merchant_id=merchant.id,
            product_id=prod.id,
            quantity=qty,
            total_amount=total,
            status=status,
            razorpay_order_id=rzp_order_id,
            created_at=order_date
        )
        db.add(ord_obj)
        saved_orders.append(ord_obj)

    db.commit()
    for o in saved_orders:
        db.refresh(o)
    
    total_rev = sum(o.total_amount for o in saved_orders if o.status == OrderStatus.PAID.value)
    print(f"[*] Seeded 50 Orders (40 Paid, 5 Failed, 5 Pending) - Revenue: Rs {total_rev:,.2f}")

    # 5. Seed Exactly 10 Campaigns
    campaigns_data = [
        ("Weekend HP Laptop Mega Sale", "Limited time 12% discount on flagship HP laptops to capture high-intent gaming traffic.", 12.0, "HP Pavilion Gaming Laptop", 18.5, CampaignStatus.ACTIVE),
        ("Creator Studio Audio Blitz", "Targeted 10% promo on Sony WH-1000XM5 headphones for audio engineers and creators.", 10.0, "Sony WH-1000XM5 Wireless Headphones", 14.0, CampaignStatus.ACTIVE),
        ("Apple iPad & Pencil Pro Synergy", "Special 8% bundle companion promotion for digital artists and designers.", 8.0, "Apple iPad Air 11-inch M2", 16.0, CampaignStatus.ACTIVE),
        ("Work From Home Ergonomics Upgrade", "Generous 15% discount on high-end mesh office chairs to drive corporate basket conversions.", 15.0, "Ergonomic Mesh Office Chair", 20.0, CampaignStatus.ACTIVE),
        ("Ultrawide 4K Productivity Festival", "10% off Dell 4K UltraSharp monitors for software engineers and video editors.", 10.0, "Dell UltraSharp 27\" 4K Monitor", 12.0, CampaignStatus.COMPLETED),
        ("RGB Gaming Peripherals Flash Sale", "Flash 15% discount on mechanical RGB gaming keyboards.", 15.0, "Mechanical Gaming Keyboard RGB", 22.0, CampaignStatus.COMPLETED),
        ("Portable Power & Travel Tech Promo", "10% off high-capacity Anker 140W power banks for frequent travelers.", 10.0, "Anker 737 Power Bank 24,000mAh", 15.0, CampaignStatus.PAUSED),
        ("Streaming & Podcasting Studio Kickoff", "Special 12% promo on Elgato Stream Deck MK.2 controllers.", 12.0, "Elgato Stream Deck MK.2", 17.5, CampaignStatus.DRAFT),
        ("Audiophile Bose Earbuds Clearance", "Exclusive 8% members discount on Bose QuietComfort Ultra wireless earbuds.", 8.0, "Bose QuietComfort Ultra Earbuds", 11.0, CampaignStatus.DRAFT),
        ("Thunderbolt 4 Ultra Connectivity Drive", "10% discount on CalDigit TS4 18-port Thunderbolt workstations.", 10.0, "CalDigit TS4 Thunderbolt 4 Dock", 13.5, CampaignStatus.DRAFT),
    ]

    for title, desc, disc, target, lift, stat in campaigns_data:
        projected = round(total_rev * (1 + lift / 100), 2)
        c_obj = Campaign(
            title=title,
            description=desc,
            discount_percentage=disc,
            target_product=target,
            expected_revenue_lift=lift,
            projected_revenue=projected,
            status=stat
        )
        db.add(c_obj)

    db.commit()
    print("[*] Seeded 10 Campaigns (4 Active, 2 Completed, 1 Paused, 3 Draft)")

    # 6. Seed Exactly 6 Bundles
    bundles_data = [
        ("HP Laptop + Logitech MX Master 3S Bundle", "HP Pavilion Gaming Laptop", "Logitech MX Master 3S Wireless Mouse", 69990.0, 22.0, "Strategic hardware + peripheral pairing offering seamless out-of-the-box productivity.", BundleStatus.ACTIVE),
        ("Apple iPad Air + Apple Pencil Pro Suite", "Apple iPad Air 11-inch M2", "Apple Pencil Pro", 67990.0, 25.0, "Essential digital creative suite pairing tablet with precision haptic stylus.", BundleStatus.ACTIVE),
        ("4K Monitor + USB-C 7-in-1 Hub Duo", "Dell UltraSharp 27\" 4K Monitor", "USB-C 7-in-1 Dual Display Hub", 39499.0, 18.0, "Single cable desktop solution enabling instant dual display workstation docking.", BundleStatus.ACTIVE),
        ("Streaming Pro: Blue Yeti Mic + Elgato Stream Deck", "Blue Yeti USB Condenser Microphone", "Elgato Stream Deck MK.2", 21990.0, 20.0, "Comprehensive broadcast kit for live content creators and streamers.", BundleStatus.COMPLETED),
        ("Ergonomic Desk Power Pair: Mesh Chair + Keychron K2", "Ergonomic Mesh Office Chair", "Keychron K2 Wireless Mechanical Keyboard", 20990.0, 19.0, "Comfort-first posture and tactile typing setup designed for full-day developers.", BundleStatus.PAUSED),
        ("Travel Ultra Pack: Anker Power Bank + SanDisk 1TB SSD", "Anker 737 Power Bank 24,000mAh", "SanDisk Extreme 1TB Portable SSD", 19990.0, 16.0, "Compact fast storage and high-wattage charging for digital nomads.", BundleStatus.DRAFT),
    ]

    for bname, p1, p2, price, aov, reason, stat in bundles_data:
        projected = round(total_rev * (1 + aov / 100), 2)
        b_obj = Bundle(
            bundle_name=bname,
            product_1=p1,
            product_2=p2,
            bundle_price=price,
            expected_aov_increase=aov,
            projected_revenue=projected,
            reasoning=reason,
            status=stat
        )
        db.add(b_obj)

    db.commit()
    print("[*] Seeded 6 Bundles (3 Active, 1 Completed, 1 Paused, 1 Draft)")

    # 7. Seed Agent Actions & Audit Trail
    agent_actions_data = [
        ("GROWTH_DIAGNOSTIC", "Full Catalog & Revenue Audit", "Growth Agent", "COMPLETED"),
        ("CAMPAIGN_GENERATED", "Weekend HP Laptop Mega Sale", "Campaign Agent", "COMPLETED"),
        ("BUNDLE_GENERATED", "HP Laptop + Logitech MX Master 3S Bundle", "Bundle Agent", "COMPLETED"),
        ("CAMPAIGN_EXECUTED", "Weekend HP Laptop Mega Sale", "Execution Engine", "COMPLETED"),
        ("BUNDLE_EXECUTED", "HP Laptop + Logitech MX Master 3S Bundle", "Execution Engine", "COMPLETED"),
        ("INVENTORY_OPTIMIZATION", "Restock Notification for 4K Monitors", "Inventory Agent", "COMPLETED"),
        ("CAMPAIGN_EXECUTED", "Creator Studio Audio Blitz", "Execution Engine", "COMPLETED"),
        ("BUNDLE_EXECUTED", "Apple iPad Air + Apple Pencil Pro Suite", "Execution Engine", "COMPLETED"),
    ]

    for atype, aname, src, stat in agent_actions_data:
        aa = AgentAction(
            action_type=atype,
            action_name=aname,
            source_agent=src,
            status=stat,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(10, 500))
        )
        db.add(aa)

    audit_logs_data = [
        (Events.AI_ACTION_EXECUTED, "CAMPAIGN", 1, "AI activated campaign 'Weekend HP Laptop Mega Sale'"),
        (Events.AI_ACTION_EXECUTED, "BUNDLE", 1, "AI activated bundle 'HP Laptop + Logitech MX Master 3S Bundle'"),
        (Events.PAYMENT_VERIFIED, "ORDER", 40, "Razorpay payment verified for order #40 (Amount: Rs 65,000)"),
        (Events.AI_CAMPAIGN_CREATED, "CAMPAIGN", 2, "AI generated campaign 'Creator Studio Audio Blitz'"),
        (Events.AI_BUNDLE_CREATED, "BUNDLE", 2, "AI generated bundle 'Apple iPad Air + Apple Pencil Pro Suite'"),
        (Events.AI_ACTION_EXECUTED, "CAMPAIGN", 3, "AI published campaign 'Apple iPad & Pencil Pro Synergy' to live store"),
        (Events.PRODUCT_UPDATED, "PRODUCT", 1, "Stock adjusted after verified order capture"),
        (Events.PAYMENT_VERIFIED, "ORDER", 39, "Razorpay payment verified for order #39 (Amount: Rs 26,990)"),
    ]

    for ev_type, entity_t, entity_i, desc in audit_logs_data:
        al = AuditLog(
            event_type=ev_type,
            entity_type=entity_t,
            entity_id=entity_i,
            description=desc,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 300))
        )
        db.add(al)

    db.commit()
    print("[*] Seeded Agent Actions & Audit Trail Logs")
    db.close()
    print("[SUCCESS] All Demo Data successfully seeded!")

if __name__ == "__main__":
    seed_demo_data()
