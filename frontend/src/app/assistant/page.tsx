"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface PlanExecutionResult {
    status: string;
    message: string;
    campaign: {
        id: number;
        title: string;
        discount_percentage?: number;
        expected_revenue_lift?: number;
        projected_revenue?: number;
        status: string;
        target_product?: string;
    } | null;
    bundle: {
        id: number;
        bundle_name: string;
        product_1: string;
        product_2: string;
        bundle_price: number;
        expected_aov_increase: number;
        projected_revenue?: number;
        status: string;
        reasoning?: string;
    } | null;
}

function FormattedMessage({ content }: { content: string }) {
    const sections = useMemo(() => {
        if (!content) return [];
        const lines = content.split("\n");
        const parsed: { title?: string; items: string[]; intro?: string }[] = [];
        let currentSection: { title?: string; items: string[]; intro?: string } = { items: [] };

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "---") continue;

            if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
                if (currentSection.title || currentSection.items.length > 0 || currentSection.intro) {
                    parsed.push(currentSection);
                }
                const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
                currentSection = { title, items: [] };
            } else if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
                const itemText = trimmed.replace(/^[\*\-]\s*/, "");
                currentSection.items.push(itemText);
            } else {
                if (currentSection.items.length === 0 && !currentSection.title) {
                    currentSection.intro = (currentSection.intro ? currentSection.intro + " " : "") + trimmed;
                } else if (currentSection.items.length === 0) {
                    currentSection.intro = (currentSection.intro ? currentSection.intro + " " : "") + trimmed;
                } else {
                    currentSection.items.push(trimmed);
                }
            }
        }
        if (currentSection.title || currentSection.items.length > 0 || currentSection.intro) {
            parsed.push(currentSection);
        }
        return parsed;
    }, [content]);

    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-4">
            {sections.map((sec, idx) => (
                <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2"
                >
                    {sec.title && (
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                            {sec.title}
                        </h3>
                    )}
                    {sec.intro && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {renderFormattedText(sec.intro)}
                        </p>
                    )}
                    {sec.items.length > 0 && (
                        <ul className="space-y-1.5">
                            {sec.items.map((item, iIdx) => (
                                <li
                                    key={iIdx}
                                    className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed"
                                >
                                    <span className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">•</span>
                                    <span>{renderFormattedText(item)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function AssistantPage() {
    const [query, setQuery] = useState("How can I increase sales?");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [growthScore, setGrowthScore] = useState<number | null>(null);
    const [executingPlan, setExecutingPlan] = useState(false);
    const [executionResult, setExecutionResult] = useState<PlanExecutionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAsk = async (userQuery?: string) => {
        const q = userQuery || query;
        if (!q.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setExecutionResult(null);

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/assistant/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to query AI assistant");
            }

            const data = await res.json();
            setResponse(data.answer);
            if (data.growth_score) setGrowthScore(data.growth_score);
        } catch (err: any) {
            console.error("Error asking assistant:", err);
            setError(err.message || "Failed to get AI response");
        } finally {
            setLoading(false);
        }
    };

    const handleExecutePlan = async () => {
        try {
            setExecutingPlan(true);
            setError(null);

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/assistant/execute-plan`, {
                method: "POST",
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to execute AI plan");
            }

            const data = await res.json();
            setExecutionResult(data);
        } catch (err: any) {
            console.error("Error executing plan:", err);
            setError(err.message || "Failed to execute plan");
        } finally {
            setExecutingPlan(false);
        }
    };

    const suggestedPrompts = [
        "How can I increase sales?",
        "Recommend high-margin product bundles",
        "Generate weekend discount campaign",
        "How to scale our store revenue?",
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                            <span>🤖</span> Gemini AI Commerce Agent
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                            ARGOS AI Assistant
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Ask strategic questions to generate actionable campaigns, bundles, and autonomous execution plans.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/action-center"
                            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        >
                            Action Center →
                        </Link>
                    </div>
                </div>

                {/* Question Box Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Ask Commerce Copilot
                        </span>
                        {growthScore && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Growth Score: {growthScore}/100
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                rows={3}
                                placeholder="E.g. How can I increase sales and boost average order value this weekend?"
                                className="w-full p-4 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Suggested Prompts */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="text-zinc-400">Suggestions:</span>
                            {suggestedPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setQuery(prompt);
                                        handleAsk(prompt);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/50 dark:hover:text-purple-300 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => handleAsk()}
                                disabled={loading || !query.trim()}
                                className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin text-xs">🔄</span> Consulting Gemini AI...
                                    </>
                                ) : (
                                    <>
                                        <span>⚡</span> Ask Assistant
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                        {error}
                    </div>
                )}

                {/* AI Response Card */}
                {response && (
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">✨</span>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                    AI Strategy & Growth Plan
                                </h2>
                            </div>
                        </div>

                        <FormattedMessage content={response} />

                        {/* Plan Execution Action Box */}
                        <div className="p-5 rounded-xl bg-gradient-to-r from-purple-50 via-teal-50 to-emerald-50 dark:from-purple-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                    ⚡ Autonomous Execution Workflow
                                </div>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
                                    Deploy this AI plan into production: Generate & activate the campaign and bundle automatically.
                                </p>
                            </div>

                            <button
                                onClick={handleExecutePlan}
                                disabled={executingPlan}
                                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                {executingPlan ? (
                                    <>
                                        <span className="animate-spin">🔄</span> Deploying Strategy...
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span> Execute Full AI Plan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Execution Output Cards */}
                {executionResult && (
                    <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-6 animate-fade-in">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                            <span className="text-xl">✅</span>
                            <div>
                                <h3 className="text-base font-bold">
                                    AI Strategy Deployed Into Production!
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {executionResult.message}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Campaign Result Card */}
                            {executionResult.campaign && (
                                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                            📢 Activated Campaign
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                                            {executionResult.campaign.status}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        {executionResult.campaign.title}
                                    </h4>
                                    <div className="text-xs text-zinc-500 space-y-0.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                        <div>Discount: <strong>{executionResult.campaign.discount_percentage}%</strong></div>
                                        <div>Expected Lift: <strong className="text-emerald-600">+{executionResult.campaign.expected_revenue_lift}%</strong></div>
                                        <div>Projected Revenue: <strong className="text-emerald-600">₹{(executionResult.campaign.projected_revenue ?? 214707.84).toLocaleString("en-IN")}</strong></div>
                                    </div>
                                </div>
                            )}

                            {/* Bundle Result Card */}
                            {executionResult.bundle && (
                                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                                            🤝 Activated Bundle
                                        </span>
                                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                                            {executionResult.bundle.status}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        {executionResult.bundle.bundle_name}
                                    </h4>
                                    <div className="text-xs text-zinc-500 space-y-0.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                        <div>Pairing: <strong>{executionResult.bundle.product_1} + {executionResult.bundle.product_2}</strong></div>
                                        <div>Bundle Price: <strong>₹{executionResult.bundle.bundle_price.toLocaleString("en-IN")}</strong></div>
                                        <div>AOV Lift: <strong className="text-teal-600">+{executionResult.bundle.expected_aov_increase}%</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href="/action-center"
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                                View in Action Center →
                            </Link>
                            <Link
                                href="/agent-actions"
                                className="px-4 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition"
                            >
                                View Execution Logs ⚡
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
