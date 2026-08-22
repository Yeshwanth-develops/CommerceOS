"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import BuyButton from "@/components/products/BuyButton";

export interface Product {
    id: number;
    title: string;
    description?: string;
    price: number;
    stock: number;
    inventory_status?: string;
    merchant_id?: number;
    category_id?: number | null;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [stockFilter, setStockFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formTitle, setFormTitle] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formStock, setFormStock] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchProducts = useCallback(async (query: string = "") => {
        try {
            setLoading(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const url = query
                ? `${baseUrl}/products/?search=${encodeURIComponent(query)}`
                : `${baseUrl}/products/`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(search);
    }, [fetchProducts, search]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle || !formPrice) {
            setFormMessage({ type: "error", text: "Title and Price are required." });
            return;
        }

        try {
            setFormSubmitting(true);
            setFormMessage(null);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/products/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formTitle.trim(),
                    price: parseFloat(formPrice),
                    stock: parseInt(formStock || "10", 10),
                    description: formDesc.trim() || undefined,
                    merchant_id: 1,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to save product");
            }

            setFormMessage({ type: "success", text: "Product saved & inventory updated successfully!" });
            setFormTitle("");
            setFormPrice("");
            setFormStock("");
            setFormDesc("");
            fetchProducts(search);
            setTimeout(() => {
                setIsAddModalOpen(false);
                setFormMessage(null);
            }, 1200);
        } catch (err: any) {
            setFormMessage({ type: "error", text: err.message || "Failed to save product" });
        } finally {
            setFormSubmitting(false);
        }
    };

    // Calculate dynamic inventory analytics
    const totalInventoryValue = useMemo(() => {
        return products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);
    }, [products]);

    const lowStockCount = useMemo(() => {
        return products.filter((p) => p.stock > 0 && p.stock < 15).length;
    }, [products]);

    const outOfStockCount = useMemo(() => {
        return products.filter((p) => p.stock <= 0).length;
    }, [products]);

    // Filtering & Sorting
    const filteredProducts = useMemo(() => {
        let list = [...products];

        // Stock status filter
        if (stockFilter === "AVAILABLE") {
            list = list.filter((p) => p.stock >= 15);
        } else if (stockFilter === "LOW") {
            list = list.filter((p) => p.stock > 0 && p.stock < 15);
        } else if (stockFilter === "OUT") {
            list = list.filter((p) => p.stock <= 0);
        }

        // Sorting
        if (sortBy === "NEWEST" || sortBy === "ID_DESC") {
            list.sort((a, b) => b.id - a.id);
        } else if (sortBy === "OLDEST" || sortBy === "ID_ASC") {
            list.sort((a, b) => a.id - b.id);
        } else if (sortBy === "PRICE_DESC") {
            list.sort((a, b) => b.price - a.price);
        } else if (sortBy === "PRICE_ASC") {
            list.sort((a, b) => a.price - b.price);
        } else if (sortBy === "STOCK_DESC") {
            list.sort((a, b) => b.stock - a.stock);
        } else if (sortBy === "STOCK_ASC") {
            list.sort((a, b) => a.stock - b.stock);
        } else if (sortBy === "NAME_ASC") {
            list.sort((a, b) => a.title.localeCompare(b.title));
        }

        return list;
    }, [products, stockFilter, sortBy]);

    const getStockBadge = (stock: number) => {
        if (stock <= 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Out of Stock
                </span>
            );
        }
        if (stock < 15) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Low Stock ({stock})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                In Stock ({stock})
            </span>
        );
    };

    const getProductIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes("laptop") || t.includes("macbook")) return "💻";
        if (t.includes("headphone") || t.includes("earbud") || t.includes("audio") || t.includes("yeti")) return "🎧";
        if (t.includes("mouse") || t.includes("keyboard") || t.includes("dock") || t.includes("hub") || t.includes("ssd") || t.includes("deck")) return "⌨️";
        if (t.includes("monitor") || t.includes("screen") || t.includes("ultrasharp")) return "🖥️";
        if (t.includes("ipad") || t.includes("tablet") || t.includes("watch") || t.includes("kindle") || t.includes("pencil")) return "📱";
        if (t.includes("chair") || t.includes("desk") || t.includes("light")) return "🪑";
        return "📦";
    };

    return (
        <div className="min-h-screen bg-zinc-50/60 dark:bg-black p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Top Header & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                            <span>📦</span> Store Inventory & Catalog
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Product Management
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Real-time stock monitoring, pricing management, and instantaneous Razorpay checkout integration.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 font-semibold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                            <span>+</span> Add New Product
                        </button>
                    </div>
                </div>

                {/* 4-Metric Inventory KPI Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Total Products
                        </span>
                        <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {products.length} <span className="text-xs font-medium text-zinc-400">SKUs</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Inventory Asset Value
                        </span>
                        <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹{totalInventoryValue.toLocaleString("en-IN")}
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Low Stock Alerts (&lt;15)
                        </span>
                        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            {lowStockCount} <span className="text-xs font-medium text-zinc-400">items</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block">
                            Out of Stock
                        </span>
                        <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                            {outOfStockCount} <span className="text-xs font-medium text-zinc-400">items</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Toolbar Controls */}
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 text-sm">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search by product name or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filters & View Modes */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Stock Filter */}
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                        >
                            <option value="ALL">All Stock Levels</option>
                            <option value="AVAILABLE">In Stock (&ge;15)</option>
                            <option value="LOW">Low Stock (&lt;15)</option>
                            <option value="OUT">Out of Stock</option>
                        </select>

                        {/* Sort Filter */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                        >
                            <option value="NEWEST">Recently Added First (Newest)</option>
                            <option value="OLDEST">Oldest First</option>
                            <option value="PRICE_DESC">Price: High to Low</option>
                            <option value="PRICE_ASC">Price: Low to High</option>
                            <option value="STOCK_DESC">Stock: High to Low</option>
                            <option value="STOCK_ASC">Stock: Low to High</option>
                            <option value="NAME_ASC">Name: A to Z</option>
                        </select>

                        {/* View Switcher (Grid / Table) */}
                        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                    viewMode === "grid"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                                title="Grid View"
                            >
                                <span>🔲</span> Grid
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                                    viewMode === "table"
                                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                }`}
                                title="Table View"
                            >
                                <span>📋</span> Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading && products.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                        <div className="animate-spin text-2xl">🔄</div>
                        <p className="text-sm text-zinc-500">Loading catalog items...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                        <div className="text-3xl">📦</div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            No products match your filters
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Try adjusting your search keywords or stock level filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearch("");
                                setStockFilter("ALL");
                            }}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : viewMode === "grid" ? (
                    /* 1. Rich Modern E-Commerce Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                                            {getProductIcon(p.title)}
                                        </div>
                                        <div>
                                            {getStockBadge(p.stock)}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-mono text-zinc-400 block">
                                            SKU #{p.id}
                                        </span>
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                            {p.title}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                                            {p.description || "High performance e-commerce catalog item."}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] font-medium text-zinc-400 block">
                                            Price
                                        </span>
                                        <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                                            ₹{p.price.toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    <BuyButton
                                        productId={p.id}
                                        merchantId={p.merchant_id || 1}
                                        title={p.title}
                                        stock={p.stock}
                                        onPaymentSuccess={() => fetchProducts(search)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 2. High-Density SaaS Data Table View */
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3.5 px-4 w-16">ID</th>
                                        <th className="py-3.5 px-4">Product Details</th>
                                        <th className="py-3.5 px-4">Price</th>
                                        <th className="py-3.5 px-4">Inventory Level</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Quick Checkout</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {filteredProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition"
                                        >
                                            <td className="py-3.5 px-4 font-mono text-zinc-400">
                                                #{p.id}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                                                        {getProductIcon(p.title)}
                                                    </span>
                                                    <div>
                                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                                            {p.title}
                                                        </div>
                                                        {p.description && (
                                                            <div className="text-[11px] text-zinc-400 truncate max-w-sm">
                                                                {p.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-zinc-900 dark:text-zinc-100">
                                                ₹{p.price.toLocaleString("en-IN")}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                                                {p.stock} units
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {getStockBadge(p.stock)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <BuyButton
                                                    productId={p.id}
                                                    merchantId={p.merchant_id || 1}
                                                    title={p.title}
                                                    stock={p.stock}
                                                    onPaymentSuccess={() => fetchProducts(search)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Product Modal Dialog */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                        Add or Restock Product
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        Adding an existing title will automatically restock and update inventory.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setFormMessage(null);
                                    }}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    ✕
                                </button>
                            </div>

                            {formMessage && (
                                <div
                                    className={`p-3 rounded-xl text-xs ${
                                        formMessage.type === "success"
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                                            : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                                    }`}
                                >
                                    {formMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleCreateProduct} className="space-y-3.5">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                                        Product Title *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                                            Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="26990"
                                            value={formPrice}
                                            onChange={(e) => setFormPrice(e.target.value)}
                                            step="0.01"
                                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                                            Stock Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="25"
                                            value={formStock}
                                            onChange={(e) => setFormStock(e.target.value)}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Industry-leading noise canceling wireless headphones..."
                                        value={formDesc}
                                        onChange={(e) => setFormDesc(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="px-5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {formSubmitting ? "Saving..." : "Save Product"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}