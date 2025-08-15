import { firebaseAuthService } from "../auth/firebase-auth";

export interface User {
    id: string;
    firebaseUid: string;
    email: string;
    googleId: string | null;
    gender: "unknown" | "male" | "female";
    dateOfBirth: Date | null;
    tosVersion: string | null;
    tosAcceptedAt: Date | null;
    rateCount: number;
    uploadedImageIds: string[];
    poolImageIds: string[];
    displayName?: string | null;
    photoUrl?: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cache for user data to avoid repeated API calls
const USER_CACHE_KEY = "hotlympics_user_cache";
const USER_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours (was 5 minutes)

interface UserCache {
    user: User;
    timestamp: number;
}

const getCachedUser = (): User | null => {
    try {
        const cached = localStorage.getItem(USER_CACHE_KEY);
        if (!cached) return null;

        const data: UserCache = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        const isExpired = age > USER_CACHE_DURATION;

        if (isExpired) {
            localStorage.removeItem(USER_CACHE_KEY);
            return null;
        }

        return data.user;
    } catch {
        return null;
    }
};

const setCachedUser = (user: User): void => {
    try {
        const cacheData: UserCache = {
            user,
            timestamp: Date.now(),
        };
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch {
        // Ignore cache errors
    }
};

const getCurrentUser = async (): Promise<User | null> => {
    try {
        const token = await firebaseAuthService.getIdToken();
        
        if (!token) {
            return null;
        }

        // Check cache first
        const cachedUser = getCachedUser();
        
        if (cachedUser) {
            return cachedUser;
        }

        // Fetch from server if not cached
        const response = await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch user:", response.statusText);
            return null;
        }

        const data = await response.json();
        const user = data as User;

        // Cache the result
        setCachedUser(user);

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

const clearUserCache = (): void => {
    try {
        localStorage.removeItem(USER_CACHE_KEY);
    } catch {
        // Ignore errors
    }
};

export const userCacheService = {
    getCurrentUser,
    clearUserCache,
    setCachedUser,
    USER_CACHE_DURATION,
};
