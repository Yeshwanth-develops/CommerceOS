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
                        Merchant Growth Copilot & Autonomous E-Commerce Operating System
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href="/growth"
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600 transition shadow-sm block group"
                    >
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                            AI Agent
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                            ✨ Growth Copilot & Intelligence →
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-2 leading-relaxed">
                            Autonomous diagnostic analysis, growth score evaluation, revenue opportunities, and stock optimization powered by Gemini AI.
                        </p>
                    </Link>

                    <Link
                        href="/products"
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm block group"
                    >
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Catalog
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                            📦 Product Management →
                        </h2>
                        <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                            Add products, track real-time stock levels, and trigger instant Razorpay checkout.
                        </p>
                    </Link>

                    <Link
                        href="/orders"
                        className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm block group"
                    >
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Transactions
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
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
                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Compliance
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
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