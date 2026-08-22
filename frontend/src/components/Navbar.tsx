"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    label: string;
    href: string;
    badge?: string;
}

const NAV_GROUPS: { groupName: string; items: NavItem[] }[] = [
    {
        groupName: "Store",
        items: [
            { label: "Overview", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Products", href: "/products" },
            { label: "Orders", href: "/orders" },
        ],
    },
    {
        groupName: "AI Growth",
        items: [
            { label: "Growth Agent", href: "/growth", badge: "AI" },
            { label: "Campaigns", href: "/campaigns" },
            { label: "Bundles", href: "/bundles" },
        ],
    },
    {
        groupName: "Operations",
        items: [
            { label: "Action Center", href: "/action-center", badge: "⚡" },
            { label: "Execution Logs", href: "/agent-actions" },
            { label: "Audit Trail", href: "/audit" },
        ],
    },
];

export default function Navbar() {
    const pathname = usePathname();

    // Do not show navbar on home landing page
    if (pathname === "/") {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 group focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-900 flex items-center justify-center font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <span>A</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                                    ARGOS
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] tracking-wider uppercase border border-purple-500/20">
                                    AI
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium -mt-0.5">
                                Autonomous Retail
                            </span>
                        </div>
                    </Link>

                    {/* Segmented Modern Navigation Pills */}
                    <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                        {NAV_GROUPS.map((group, gIdx) => (
                            <div key={group.groupName} className="flex items-center">
                                {gIdx > 0 && (
                                    <div className="h-4 w-[1px] bg-zinc-300/80 dark:bg-zinc-700/80 mx-1.5" />
                                )}
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                                                isActive
                                                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold border border-zinc-200/60 dark:border-zinc-700/60"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-800/40"
                                            }`}
                                        >
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                                        isActive
                                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                                            : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Mobile / Compact scrollable nav for smaller screens */}
                <div className="flex lg:hidden overflow-x-auto py-1 items-center gap-1 text-xs">
                    {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
                                    isActive
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Status Indicator */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Store Online</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
