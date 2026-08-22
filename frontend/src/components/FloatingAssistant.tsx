"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    timestamp: Date;
    planExecution?: PlanExecutionResult | null;
    showSuggestions?: boolean;
}

function AssistantAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" | "btn" }) {
    const dim = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : size === "btn" ? "w-12 h-12" : "w-8 h-8";

    return (
        <div className={`relative ${dim} flex items-center justify-center shrink-0 select-none`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Speech bubbles above */}
                <rect x="36" y="8" width="34" height="18" rx="4" fill="#F97316" stroke="#0F172A" strokeWidth="3" />
                <path d="M42 26 L46 32 L50 26 Z" fill="#F97316" stroke="#0F172A" strokeWidth="2.5" />
                
                <rect x="22" y="18" width="36" height="20" rx="5" fill="#FBBF24" stroke="#0F172A" strokeWidth="3" />
                <path d="M26 38 L22 45 L32 38 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="2.5" />
                
                {/* Speech bubble dots */}
                <circle cx="32" cy="28" r="2" fill="#0F172A" />
                <circle cx="40" cy="28" r="2" fill="#0F172A" />
                <circle cx="48" cy="28" r="2" fill="#0F172A" />

                {/* Left Ear / Antenna */}
                <rect x="8" y="58" width="10" height="12" rx="3" fill="#C7D2FE" stroke="#0F172A" strokeWidth="3" />
                
                {/* Robot Head */}
                <rect x="18" y="44" width="60" height="48" rx="18" fill="#93C5FD" stroke="#0F172A" strokeWidth="4" />
                
                {/* Face screen inner */}
                <rect x="26" y="50" width="44" height="34" rx="10" fill="#DBEAFE" />

                {/* Eyes */}
                <rect x="36" y="60" width="4" height="8" rx="2" fill="#0F172A" />
                <rect x="56" y="60" width="4" height="8" rx="2" fill="#0F172A" />
                
                {/* Mouth */}
                <ellipse cx="48" cy="74" rx="3" ry="2" fill="#0F172A" />

                {/* Headset Mic on right */}
                <path d="M74 58 C78 58, 80 62, 80 68 C80 74, 76 78, 68 80" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="68" cy="80" r="4" fill="#0F172A" />
            </svg>
        </div>
    );
}

function FormattedContent({ content }: { content: string }) {
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
                    <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="space-y-2 text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">
            {sections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                    {sec.title && (
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[13px] flex items-center gap-1.5 mt-2 first:mt-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                            {sec.title}
                        </div>
                    )}
                    {sec.intro && (
                        <p className="text-zinc-700 dark:text-zinc-300">
                            {renderFormattedText(sec.intro)}
                        </p>
                    )}
                    {sec.items.length > 0 && (
                        <ul className="space-y-1 pl-1">
                            {sec.items.map((item, iIdx) => (
                                <li key={iIdx} className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300">
                                    <span className="text-blue-500 font-bold">•</span>
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

export default function FloatingAssistant() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [executingPlan, setExecutingPlan] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "bot",
            text: `Hello 👋\nWelcome!\nI can help you analyze revenue, launch AI campaigns, bundle products, and execute growth plans.\nTry one of the suggestions below.`,
            timestamp: new Date(),
            showSuggestions: true,
        },
    ]);

    const [history, setHistory] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages, loading]);

    const handleSend = async (queryText?: string) => {
        const text = (queryText || input).trim();
        if (!text) return;

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setHistory((prev) => (prev.includes(text) ? prev : [text, ...prev]));
        setLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/assistant/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: text }),
            });

            if (!res.ok) {
                throw new Error("Failed to get response");
            }

            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: data.answer || "I have analyzed your store and prepared strategic recommendations.",
                timestamp: new Date(),
                showSuggestions: true,
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: "⚠️ I encountered an issue connecting to the AI brain. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleExecutePlan = async () => {
        setExecutingPlan(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${baseUrl}/assistant/execute-plan`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Execution failed");
            const data = await res.json();

            const execMsg: Message = {
                id: Date.now().toString(),
                sender: "bot",
                text: "🚀 AI Growth Plan successfully deployed to production! Campaign and Bundle are now ACTIVE in your store.",
                planExecution: data,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, execMsg]);
        } catch (err) {
            const failMsg: Message = {
                id: Date.now().toString(),
                sender: "bot",
                text: "❌ Could not deploy plan. Please check Execution Center.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, failMsg]);
        } finally {
            setExecutingPlan(false);
        }
    };

    const handleNewChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                sender: "bot",
                text: `Hello 👋\nWelcome!\nI can help you analyze revenue, launch AI campaigns, bundle products, and execute growth plans.\nTry one of the suggestions below.`,
                timestamp: new Date(),
                showSuggestions: true,
            },
        ]);
        setShowHistory(false);
    };

    const handleSuggestionClick = (action: string) => {
        if (action === "Open Products") {
            router.push("/products");
            return;
        }
        if (action === "Open Orders") {
            router.push("/orders");
            return;
        }
        if (action === "Open Action Center") {
            router.push("/action-center");
            return;
        }
        if (action === "Open Growth Agent") {
            router.push("/growth");
            return;
        }
        if (action === "Execute Full Plan") {
            handleExecutePlan();
            return;
        }
        handleSend(action);
    };

    const defaultSuggestions = [
        "How can I increase sales?",
        "Find bundle opportunities",
        "Generate weekend campaign",
        "Open Action Center",
    ];

    return (
        <div className="font-sans">
            {/* 1. Floating Trigger Button (Matching Exact Image Style) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
                    title="Open Commerce Assistant"
                    aria-label="Open Commerce Assistant"
                >
                    <AssistantAvatar size="btn" />
                </button>
            )}

            {/* 2. Floating Assistant Modal Card (Matching Exact Image 2 & 3 Layout) */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[410px] h-[580px] max-h-[85vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0 relative z-20">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                title="Chat History"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center p-0.5 border border-blue-100 dark:border-blue-900">
                                <AssistantAvatar size="md" />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                    Commerce Assistant
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                        Ready to help
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Right Controls (+ , — , ✕) */}
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                            <button
                                onClick={handleNewChat}
                                className="p-1.5 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                                title="New Chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                                title="Minimize"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                                title="Close"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Left Slideout: Chat History (Exact layout of Image 3) */}
                    {showHistory && (
                        <div className="absolute inset-y-0 left-0 w-3/4 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-30 p-5 shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                    Chat History
                                </h4>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 space-y-2">
                                {history.length === 0 ? (
                                    <div className="text-center text-xs text-zinc-400 py-12">
                                        No history yet
                                    </div>
                                ) : (
                                    history.map((h, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setShowHistory(false);
                                                handleSend(h);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition truncate cursor-pointer"
                                        >
                                            💬 {h}
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={handleNewChat}
                                className="w-full py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition cursor-pointer"
                            >
                                + Start New Session
                            </button>
                        </div>
                    )}

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/40">
                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-3">
                                {msg.sender === "bot" ? (
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1">
                                            <AssistantAvatar size="sm" />
                                        </div>
                                        <div className="flex-1 space-y-3 max-w-[85%]">
                                            {/* White Message Box Card with Rounded Corners */}
                                            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-[13px] text-zinc-800 dark:text-zinc-200 shadow-xs space-y-2">
                                                <FormattedContent content={msg.text} />

                                                {/* Plan Execution Result Card */}
                                                {msg.planExecution && (
                                                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                                                        {msg.planExecution.campaign && (
                                                            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                    📢 {msg.planExecution.campaign.title}
                                                                </span>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                                                                    ACTIVE
                                                                </span>
                                                            </div>
                                                        )}
                                                        {msg.planExecution.bundle && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                    🤝 {msg.planExecution.bundle.bundle_name}
                                                                </span>
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                                                                    ACTIVE
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action / Suggestion Pills (Exact look of Image 2) */}
                                            {msg.showSuggestions && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleSuggestionClick("How can I increase sales?")}
                                                        className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-medium transition cursor-pointer shadow-xs"
                                                    >
                                                        How can I increase sales?
                                                    </button>
                                                    <button
                                                        onClick={() => handleSuggestionClick("Find bundle opportunities")}
                                                        className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-medium transition cursor-pointer shadow-xs"
                                                    >
                                                        Find bundle opportunities
                                                    </button>
                                                    <button
                                                        onClick={() => handleSuggestionClick("Execute Full Plan")}
                                                        disabled={executingPlan}
                                                        className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                                                    >
                                                        {executingPlan ? "Deploying..." : "⚡ Execute Full Plan"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSuggestionClick("Open Action Center")}
                                                        className="px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 text-xs font-medium transition cursor-pointer shadow-xs"
                                                    >
                                                        Open Action Center
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <div className="p-3 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium max-w-[80%] shadow-xs">
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading Typing Indicator */}
                        {loading && (
                            <div className="flex items-start gap-2.5">
                                <AssistantAvatar size="sm" />
                                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center gap-2 shadow-xs">
                                    <span className="animate-bounce">●</span>
                                    <span className="animate-bounce delay-100">●</span>
                                    <span className="animate-bounce delay-200">●</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Input Container (Exact Pill Look with Send Plane Icon) */}
                    <div className="p-3.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition shadow-xs"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a command..."
                                className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 transition cursor-pointer shrink-0"
                                title="Send"
                            >
                                <svg className="w-4 h-4 transform rotate-45 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
