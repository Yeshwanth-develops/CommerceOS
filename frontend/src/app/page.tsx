import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 overflow-x-hidden">
            {/* Subtle Gradient Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent blur-3xl rounded-full" />
                <div className="absolute top-[600px] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-3xl rounded-full" />
            </div>

            {/* 1. HERO SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center space-y-8">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold tracking-wide shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ARGOS 2.0 • Autonomous Retail Engine</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.12]">
                        The Autonomous Operating System for <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">Modern E-Commerce</span>
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
                        ARGOS combines AI-driven catalog diagnostics, automated bundle generation, and real-time Razorpay checkout telemetry into a single self-driving commerce platform.
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-white/90 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                    >
                        <span>Launch Dashboard</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                    <Link
                        href="/products"
                        className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition shadow-xs"
                    >
                        Explore Storefront
                    </Link>
                </div>

                {/* 2. INTERACTIVE PLATFORM PREVIEW MOCKUP */}
                <div className="pt-10 max-w-5xl mx-auto">
                    <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300/80 dark:border-zinc-700/80 shadow-2xl backdrop-blur-md">
                        <div className="bg-white dark:bg-zinc-950 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-8 text-left space-y-6">
                            {/* App Window Header Bar */}
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                    <span className="ml-2 text-xs font-mono text-zinc-400">argos.commerceos.app/dashboard</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Store Telemetry
                                </div>
                            </div>

                            {/* Key Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                                    <span className="text-xs text-zinc-500 font-medium">Gross Revenue</span>
                                    <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">₹9,43,136</div>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">↑ 100% Verified</span>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                                    <span className="text-xs text-zinc-500 font-medium">Capture Rate</span>
                                    <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">80.0%</div>
                                    <span className="text-[11px] text-zinc-500 mt-0.5 block">40 of 50 Orders</span>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                                    <span className="text-xs text-zinc-500 font-medium">Active Catalog</span>
                                    <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">21 SKUs</div>
                                    <span className="text-[11px] text-zinc-500 mt-0.5 block">530 Total Units</span>
                                </div>

                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                                    <span className="text-xs text-zinc-500 font-medium">Growth Health</span>
                                    <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">88/100</div>
                                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 block">Optimal Health</span>
                                </div>
                            </div>

                            {/* Quick Feature Action Preview Strip */}
                            <div className="p-4 rounded-xl bg-zinc-900 dark:bg-zinc-900/90 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                                        ⚡
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-zinc-100">AI Strategy Simulation: Creator Studio Bundle</p>
                                        <p className="text-[11px] text-zinc-400">Pairs Flagship Laptop + MX Mouse for +22% projected AOV uplift</p>
                                    </div>
                                </div>
                                <Link
                                    href="/action-center"
                                    className="px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold transition whitespace-nowrap"
                                >
                                    Activate in Action Center →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE CAPABILITIES (Clean Bento Grid) */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-200 dark:border-zinc-800/80">
                <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                        Built for Scale, Automation, and Reliability
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Everything needed to operate an autonomous commerce storefront without spreadsheet guesswork.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-bold">
                            🧠
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            AI Growth Intelligence
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Continuous auditing of store velocity, stockout hazard detection, and natural language Copilot briefings for actionable merchant decisions.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold">
                            💳
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Razorpay Settlement Telemetry
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Frictionless 1-click modal checkout, HMAC-SHA256 cryptographic verification, and real-time inventory updates on captured payments.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                            ⚡
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            1-Click Action Command Center
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Simulate financial outcomes before deploying. Review generated campaigns and bundles, then activate them live to your storefront in one click.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. CALL TO ACTION SECTION */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
                <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 dark:bg-zinc-900 text-white text-center space-y-6 shadow-xl border border-zinc-800">
                    <div className="space-y-2 max-w-xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Ready to Experience ARGOS?
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Explore live analytics, test autonomous campaigns, or test live Razorpay checkout.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs transition"
                        >
                            Open Dashboard →
                        </Link>
                        <Link
                            href="/assistant"
                            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition"
                        >
                            AI Commerce Copilot
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
