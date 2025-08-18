// Dynamic API URL that works for both localhost and network access
export const getApiUrl = (): string => {
    // Use environment variable if set
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // If accessing from localhost, use localhost
    if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    ) {
        return "http://localhost:3000";
    }

    // If accessing from network IP, use the same IP for API
    return `http://${window.location.hostname}:3000`;
};
