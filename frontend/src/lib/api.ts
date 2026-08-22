const rawUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API_URL = rawUrl.replace(/\/+$/, "");

export default API_URL;