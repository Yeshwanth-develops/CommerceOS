import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md transition-colors mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand & Creator Bio */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-extrabold text-xs shadow-xs">
                                <span>A</span>
                            </div>
                            <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                                ARGOS
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] tracking-wider uppercase border border-purple-500/20">
                                AI 2.0
                            </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                            Autonomous multi-agent retail operating system powered by Google Gemini AI and Razorpay. Designed to automate revenue growth, inventory forecasting, and campaign execution.
                        </p>
                        <div className="pt-1">
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                Architected & Developed by <strong className="text-purple-600 dark:text-purple-400 font-bold">Yeshwanth Sunkara</strong>
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Navigation
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <li>
                                <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Overview & Story
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Command Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Catalog & Inventory
                                </Link>
                            </li>
                            <li>
                                <Link href="/action-center" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    1-Click Action Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Autonomous Intelligence */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Autonomous Core
                        </h4>
                        <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <li>
                                <Link href="/growth" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Growth Copilot
                                </Link>
                            </li>
                            <li>
                                <Link href="/assistant" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Commerce Copilot
                                </Link>
                            </li>
                            <li>
                                <Link href="/agent-actions" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Execution Logs
                                </Link>
                            </li>
                            <li>
                                <Link href="/audit" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
                                    Cryptographic Audit
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
                    <div>
                        © {new Date().getFullYear()} ARGOS Autonomous Retail OS. All rights reserved.
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Created by <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">Yeshwanth Sunkara</strong></span>
                        <span>•</span>
                        <span>Next.js 16 + FastAPI + Gemini AI</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
