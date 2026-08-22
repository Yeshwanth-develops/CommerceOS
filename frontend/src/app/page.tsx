import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-purple-500 selection:text-white pb-20">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-500/20 via-indigo-500/15 to-teal-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
            </div>

            {/* 1. HERO SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold tracking-wide shadow-xs animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span>ARGOS 2.0 • Autonomous Retail Operating System</span>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
                        The <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">Self-Driving Brain</span> for Modern E-Commerce
                    </h1>
                    <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-3xl mx-auto">
                        Traditional stores force merchants to spend dozens of hours guessing discount percentages and managing fragmented spreadsheets. <strong>ARGOS</strong> is an autonomous multi-agent operating system that detects revenue opportunities, simulates financial ROI, and deploys high-converting commerce campaigns in 1 click.
                    </p>
                </div>

                {/* Primary Single CTA Button */}
                <div className="flex items-center justify-center pt-2">
                    <Link
                        href="/dashboard"
                        className="px-9 py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-base hover:opacity-95 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 cursor-pointer group"
                    >
                        <span>🚀 Click to Explore</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                </div>

                {/* Live Store Telemetry Ribbon */}
                <div className="pt-8">
                    <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-md grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Gross Revenue</span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">₹9,43,136</span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">✓ 100% Captured in Razorpay</span>
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Checkout Capture Rate</span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">80.0%</span>
                            <span className="text-[11px] text-zinc-500 block">40 Settled / 50 Orders</span>
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Active Catalog SKUs</span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">21 Products</span>
                            <span className="text-[11px] text-zinc-500 block">530 In-Warehouse Units</span>
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Autonomous Health Score</span>
                            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">88/100</span>
                            <span className="text-[11px] text-purple-600 dark:text-purple-300 font-semibold block">Live AI Diagnostics</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. THE PROBLEM SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        The Core Friction
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Why eCommerce Merchants Lose Revenue Every Day
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        Managing an online store requires juggling dozens of disparate tools without a cohesive decision engine.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 hover:border-rose-300 dark:hover:border-rose-800/60 transition">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">
                            🛑
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Manual Strategy Guesswork
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Merchants launch discounts by gut feeling without modeling price elasticity. This frequently leads to deep price cuts that erode profit margins without lifting total order volume.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 hover:border-amber-300 dark:hover:border-amber-800/60 transition">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Silent Inventory Stockouts
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Inventory alerts arrive too late. When anchor items dip below safety thresholds, marketing promotions drive traffic to out-of-stock product pages, resulting in lost conversions.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800/60 transition">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
                            📉
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Missed Basket Expansion (AOV)
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            High-intent buyers purchase single items because stores lack automated product pairing and cross-sell bundling incentives at the moment of checkout.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. THE SOLUTION SECTION */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        The ARGOS Solution
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Autonomous Multi-Agent Retail Intelligence
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        ARGOS replaces manual merchant workflows with a coordinated ecosystem of specialized AI agents.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
                            🧠
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Growth Copilot</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Continuously audits catalog velocities, calculates store health scores (88/100), and formulates plain-English merchant briefings.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                            ⚡
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Generative Bundling</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Analyzes product affinities to engineer high-converting pairs (e.g. Laptop + MX Master Mouse) with +18% to +22% AOV lift.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                            💳
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Razorpay Engine</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Seamless 1-click modal checkout, HMAC-SHA256 cryptographic verification, and real-time inventory decrement webhooks.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl font-bold">
                            🛡️
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Compliance Audit</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Immutable cryptographic ledger tracking every autonomous AI execution, status change, and payment capture.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. THE 6-STAGE AUTONOMOUS WORKFLOW */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Autonomous Execution Loop
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        The 6-Stage Autonomous Workflow
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        How ARGOS moves from raw catalog data to verified bank deposits in an automated continuous loop.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">1</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Detects Opportunity</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Growth Copilot scans 21 catalog SKUs, identifies 5 low-stock items, and spots cart abandonment patterns.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: /growth</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">2</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Generates Strategy</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Campaign & Bundle agents generate 10%–12% flash promotions and complementary multi-item packages.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: /campaigns & /bundles</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">3</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Simulates Impact</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Pre-calculates projected revenue (₹2,14,707.84) and expected AOV lift (+18%) before risking capital.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: Strategy Cards</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">4</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Merchant Approves</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Merchant reviews the simulation and clicks <strong>"Activate 🚀"</strong> in the 1-Click Action Command Center.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: /action-center</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">5</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Deploys & Activates</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Campaign status transitions to ACTIVE, storefront pricing updates live, and execution logs record to audit trail.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: /agent-actions & /audit</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 relative">
                        <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-extrabold flex items-center justify-center">6</span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Measures Results</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Razorpay webhook captures payments, updates 30-day live Recharts telemetry, and recalculates Growth Health Score.
                        </p>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Location: /dashboard</span>
                    </div>
                </div>
            </section>

            {/* 5. PRODUCTION ARCHITECTURE */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        System Architecture
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Production-Grade Full-Stack Architecture
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        Built for sub-second performance, strict type safety, and institutional-grade financial security.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Frontend</div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Next.js 16 + React 19</h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                            <li>App Router & Turbopack</li>
                            <li>Tailwind CSS v4 + ShadCN UI</li>
                            <li>Recharts Live Area Telemetry</li>
                            <li>Strict TypeScript 5.x</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Backend API</div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">FastAPI + Python 3.11</h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                            <li>Asynchronous ASGI Uvicorn Server</li>
                            <li>SQLAlchemy 2.0 ORM</li>
                            <li>Pydantic v2 Strict DTOs</li>
                            <li>Alembic Migration Pipeline</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">AI Intelligence</div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Gemini AI Multi-Agent</h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                            <li>Google Gemini 1.5/2.0 Engine</li>
                            <li>Autonomous Agent Hierarchy</li>
                            <li>Natural Language Commerce Copilot</li>
                            <li>Deterministic Fallback Advisor</li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Payments & DB</div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Razorpay + PostgreSQL</h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                            <li>Orders API & Modal Checkout</li>
                            <li>HMAC-SHA256 Webhook Verification</li>
                            <li>PostgreSQL Production Connection</li>
                            <li>Zero-Config SQLite Local DB</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 6. BUSINESS IMPACT & RESULTS */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Measurable Impact
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Tangible Business Outcomes
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                        Demonstrated performance metrics across live catalog and transaction testing.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">+22.0%</span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AOV Lift</h4>
                        <p className="text-xs text-zinc-500">Achieved via automated pairing of hardware and input peripherals.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">+18.5%</span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Conversion Velocity</h4>
                        <p className="text-xs text-zinc-500">On targeted 10%–12% flash promotions for cart abandoners.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Catalog Availability</h4>
                        <p className="text-xs text-zinc-500">Zero stockout incidents using 15-unit proactive buffer alerts.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400">&lt; 1 sec</span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Deployment Speed</h4>
                        <p className="text-xs text-zinc-500">One-click strategy activation replacing hours of manual work.</p>
                    </div>
                </div>
            </section>

            {/* 7. FINAL CALL TO ACTION */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-12">
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="space-y-3 relative z-10">
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                            Experience the Future of Autonomous Retail
                        </h2>
                        <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto leading-relaxed">
                            Explore the live interactive dashboard, test the Gemini AI Commerce Copilot, and execute live autonomous campaigns.
                        </p>
                    </div>

                    <div className="flex items-center justify-center relative z-10">
                        <Link
                            href="/dashboard"
                            className="px-9 py-4 rounded-2xl bg-white text-zinc-900 font-extrabold text-base hover:bg-zinc-100 transition shadow-lg hover:scale-105 flex items-center justify-center gap-3 cursor-pointer group"
                        >
                            <span>🚀 Click to Explore</span>
                            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
