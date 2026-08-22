import requests

products = [
    ("HP Pavilion Gaming Laptop", "High performance Ryzen 7 gaming laptop with 16GB RAM and RTX 3050 graphics.", 65000.0, 18),
    ("Logitech MX Master 3S Wireless Mouse", "Ultrafast Quiet Click ergonomic mouse for master productivity.", 8995.0, 42),
    ("Sony WH-1000XM5 Wireless Headphones", "Industry-leading noise canceling wireless headphones with 30hr battery.", 26990.0, 25),
    ("Mechanical Gaming Keyboard RGB", "Hot-swappable tactile switches with customizable per-key RGB backlighting.", 4500.0, 35),
    ("Dell UltraSharp 27\" 4K Monitor", "IPS Black panel 4K monitor with 98% DCI-P3 color accuracy and USB-C hub.", 38500.0, 12),
    ("Apple iPad Air 11-inch M2", "Ultra-fast Apple M2 chip with Liquid Retina display and 128GB storage.", 59900.0, 16),
    ("Apple Pencil Pro", "Pixel-perfect precision with barrel roll, squeeze gestures, and haptic feedback.", 11900.0, 28),
    ("Samsung Galaxy Watch 6", "Advanced health tracking, personalized sleep coaching, and sapphire glass.", 19999.0, 22),
    ("Anker 737 Power Bank 24,000mAh", "140W ultra-fast charging power bank with smart digital display.", 12499.0, 30),
    ("USB-C 7-in-1 Dual Display Hub", "Aluminum multi-port adapter with 4K HDMI, 100W PD, and SD card reader.", 3299.0, 60),
    ("Bose SoundLink Flex Bluetooth Speaker", "Rugged waterproof portable speaker with PositionIQ acoustic technology.", 15900.0, 19),
    ("Kindle Paperwhite 16GB (11th Gen)", "6.8\" glare-free display with adjustable warm light and waterproof chassis.", 14999.0, 24),
    ("Elgato Stream Deck MK.2", "15 customizable LCD keys for controlling apps, streaming, and studio tools.", 14490.0, 15),
    ("Razer Kiyo Pro Streaming Webcam", "Uncompressed Full HD 1080p 60FPS webcam with adaptive light sensor.", 12999.0, 17),
    ("Ergonomic Mesh Office Chair", "Adjustable lumbar support 3D armrests breathable mesh ergonomic chair.", 16500.0, 10),
    ("SanDisk 2TB Extreme Portable SSD", "Up to 1050MB/s read speeds, NVMe rugged external solid state drive.", 17499.0, 20),
    ("Keychron K2 Wireless Mechanical Keyboard", "75% compact wireless keyboard with Gateron G Pro Brown switches.", 8499.0, 26),
    ("Marshall Emberton II Portable Speaker", "Compact portable speaker with 30+ hours playtime and True Stereophonic.", 17999.0, 14),
    ("Belkin 3-in-1 MagSafe Wireless Charger", "15W fast wireless charging tree for iPhone, Apple Watch, and AirPods.", 13999.0, 21),
    ("WD Black 1TB SN850X NVMe SSD", "PCIe Gen4 internal gaming SSD with speeds up to 7,300 MB/s.", 9499.0, 32),
    ("HyperX Cloud II Wireless Gaming Headset", "Legendary comfort with 7.1 surround sound and 30-hour battery life.", 11490.0, 27)
]

url = "https://commerceos-production-5fac.up.railway.app/products/"
print("Seeding products to live Railway...")
for title, desc, price, stock in products:
    r = requests.post(url, json={"title": title, "description": desc, "price": price, "stock": stock, "merchant_id": 1})
    print(f"[{r.status_code}] {title}")

r_all = requests.get(url)
print(f"\n✅ Total live products on Railway: {len(r_all.json())}")
