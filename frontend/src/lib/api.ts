const rawUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://commerceos-production-5fac.up.railway.app";

const API_URL = rawUrl.replace(/\/+$/, "");

export default API_URL;