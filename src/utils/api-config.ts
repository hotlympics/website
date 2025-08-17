/**
 * Dynamically determines the correct API URL based on the current environment
 * - When accessing from localhost, uses localhost:3000
 * - When accessing from network IP (like phone), uses the same IP for API calls
 * - Falls back to environment variable or localhost if detection fails
 */
export function getApiUrl(): string {
    // First try the environment variable (for production)
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl && envApiUrl !== "http://localhost:3000") {
        return envApiUrl;
    }

    // Dynamic detection for development
    if (typeof window !== "undefined") {
        const currentHost = window.location.hostname;

        // If accessing from localhost/127.0.0.1, use localhost for API
        if (currentHost === "localhost" || currentHost === "127.0.0.1") {
            return "http://localhost:3000";
        }

        // If accessing from network IP (like phone), use same IP for API
        if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
            return `http://${currentHost}:3000`;
        }
    }

    // Fallback to localhost
    return "http://localhost:3000";
}
