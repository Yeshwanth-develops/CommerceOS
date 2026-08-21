"use client";

import { useState } from "react";

export default function ProductForm({
    onProductCreated,
}: {
    onProductCreated?: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [loading, setLoading] = useState(false);

    const createProduct = async () => {
        if (!title.trim() || !price || !stock) {
            alert("Please fill in title, price, and stock");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("http://localhost:8000/products/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: Number(price),
                    stock: Number(stock),
                    merchant_id: 1,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create product");
            }

            alert("Product Created Successfully");

            setTitle("");
            setDescription("");
            setPrice("");
            setStock("");

            if (onProductCreated) {
                onProductCreated();
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Error creating product. Please check backend server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-md bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add New Product
            </h2>

            <input
                className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <input
                className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
                <input
                    type="number"
                    className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Price (₹)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <input
                    type="number"
                    className="border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg p-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Stock quantity"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                />
            </div>

            <button
                disabled={loading}
                className="bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium px-4 py-2.5 rounded-lg w-full transition disabled:opacity-50 text-sm"
                onClick={createProduct}
            >
                {loading ? "Creating..." : "Create Product"}
            </button>
        </div>
    );
}