import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        CommerceOS
                    </h1>
                    <p className="text-zinc-500 mt-2 text-base">
                        Merchant Growth Copilot & E-Commerce Operating System
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        href="/products"
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm block group"
                    >
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                            📦 Product Management →
                        </h2>
                        <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                            Add products, track real-time stock, and trigger instant Razorpay checkout.
                        </p>
                    </Link>

                    <Link
                        href="/orders"
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm block group"
                    >
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                            💳 Orders & Payments →
                        </h2>
                        <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                            Monitor transactions, order status (PENDING / PAID), and Razorpay payment tracking.
                        </p>
                    </Link>

                    <Link
                        href="/audit"
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm block group"
                    >
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                            📜 Audit Trail & Logs →
                        </h2>
                        <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                            Immutable event logs tracking product, order, payment, webhook, and AI lifecycle events.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}