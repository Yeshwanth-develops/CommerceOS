"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextType {
    showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (title: string, description?: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 4500);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const icons = {
        success: (
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        ),
        error: (
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        ),
        warning: (
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">!</span>
            </div>
        ),
        info: (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">i</span>
            </div>
        ),
    };

    const borderColors = {
        success: "border-emerald-500/30 dark:border-emerald-500/20",
        error: "border-rose-500/30 dark:border-rose-500/20",
        warning: "border-amber-500/30 dark:border-amber-500/20",
        info: "border-blue-500/30 dark:border-blue-500/20",
    };

    return (
        <div className={`pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border ${borderColors[toast.type]} rounded-2xl p-4 shadow-xl shadow-black/10 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5`}>
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{toast.title}</p>
                {toast.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition text-xs p-1"
            >
                ✕
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback if not within provider
        return {
            showToast: (title: string, description?: string) => {
                console.log(`[Toast]: ${title} - ${description}`);
            },
        };
    }
    return context;
}
