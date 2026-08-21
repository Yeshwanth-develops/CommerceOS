"use client";

import { useEffect, useState, useCallback } from "react";
import ProductForm from "@/components/products/ProductForm";
import ProductTable, { Product } from "@/components/products/ProductTable";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        Product Management
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Create and monitor your inventory status in real time.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Create Form */}
                    <div className="lg:col-span-1">
                        <ProductForm onProductCreated={() => fetchProducts(search)} />
                    </div>

                    {/* Right Column: Search + Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <input
                                type="text"
                                placeholder="Search products by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full max-w-sm px-3.5 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                            />
                            <div className="text-xs text-zinc-500 whitespace-nowrap">
                                Total: <span className="font-semibold">{products.length}</span>
                            </div>
                        </div>

                        {loading && products.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">
                                Loading products...
                            </div>
                        ) : (
                            <ProductTable
                                products={products}
                                onProductUpdated={() => fetchProducts(search)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}