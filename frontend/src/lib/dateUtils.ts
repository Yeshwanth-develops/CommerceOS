/**
 * Formats a given date/ISO string to Indian Standard Time (IST, UTC+5:30)
 */
export function formatISTDateTime(dateStr?: string | Date | null): string {
    if (!dateStr) return "—";
    try {
        const str = typeof dateStr === "string" ? dateStr.trim() : dateStr.toISOString();
        if (!str) return "—";
        
        // Ensure UTC interpretation if timezone offset is not explicitly provided
        const utcIso = str.includes("Z") || str.includes("+") ? str : str + "Z";
        const date = new Date(utcIso);
        
        if (isNaN(date.getTime())) {
            // Fallback for non-standard string formats
            const fallbackDate = new Date(str);
            if (isNaN(fallbackDate.getTime())) return "—";
            return fallbackDate.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
        }

        return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    } catch {
        return "—";
    }
}

export function formatISTDateOnly(dateStr?: string | Date | null): string {
    if (!dateStr) return "—";
    try {
        const str = typeof dateStr === "string" ? dateStr.trim() : dateStr.toISOString();
        const utcIso = str.includes("Z") || str.includes("+") ? str : str + "Z";
        const date = new Date(utcIso);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export function formatISTTimeOnly(dateStr?: string | Date | null): string {
    if (!dateStr) return "—";
    try {
        const str = typeof dateStr === "string" ? dateStr.trim() : dateStr.toISOString();
        const utcIso = str.includes("Z") || str.includes("+") ? str : str + "Z";
        const date = new Date(utcIso);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    } catch {
        return "—";
    }
}
