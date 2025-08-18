import { preloadImageWithRetry } from "@/utils/image-preloader";
import { getApiUrl } from "../../utils/api";
import { firebaseAuthService } from "../auth/firebase-auth";

const apiUrl = getApiUrl();

// Use the same types from server
export interface LeaderboardEntry {
    imageId: string;
    imageUrl: string;
    userId: string;
    rating: number;
    gender: string;
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    dateOfBirth: string;
}

export interface LeaderboardMetadata {
    generatedAt: string;
    updateCount: number;
    firstGeneratedAt: string;
    actualEntryCount: number;
    averageRating: number;
    ratingRange: {
        highest: number;
        lowest: number;
    };
    dataQuality: {
        allImagesValid: boolean;
        missingFields: string[];
        errorCount: number;
    };
    configVersion: number;
    configKey: string;
}

export interface LeaderboardDocument {
    entries: LeaderboardEntry[];
    metadata: LeaderboardMetadata;
}

export interface LeaderboardCacheData {
    entries: LeaderboardEntry[];
    metadata: LeaderboardMetadata;
    timestamp: number;
}

export interface CacheValidationResult {
    isValid: boolean;
    data?: LeaderboardCacheData;
}

const getCacheKey = (leaderboardKey: string): string => {
    return `hotlympics_leaderboard_${leaderboardKey}`;
};

const fetchLeaderboard = async (
    key: string
): Promise<LeaderboardDocument | null> => {
    try {
        const token = await firebaseAuthService.getIdToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/leaderboards/${key}`, {
            headers,
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch leaderboard ${key}:`,
                response.statusText
            );
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching leaderboard ${key}:`, error);
        return null;
    }
};

const preloadLeaderboardImages = async (
    entries: LeaderboardEntry[]
): Promise<void> => {
    // Preload images one by one to avoid overwhelming the browser
    for (const entry of entries) {
        try {
            await preloadImageWithRetry(entry.imageUrl, 3);
        } catch (error) {
            console.warn(
                `Failed to preload image for ${entry.imageId}:`,
                error
            );
        }
    }
};

const saveLeaderboard = (key: string, data: LeaderboardDocument): void => {
    try {
        const cacheData: LeaderboardCacheData = {
            entries: data.entries,
            metadata: data.metadata,
            timestamp: Date.now(),
        };

        localStorage.setItem(getCacheKey(key), JSON.stringify(cacheData));
    } catch (error) {
        console.warn(`Failed to save leaderboard cache for ${key}:`, error);
    }
};

const loadLeaderboard = (
    key: string,
    maxAge: number
): CacheValidationResult => {
    try {
        const cachedData = localStorage.getItem(getCacheKey(key));

        if (!cachedData) {
            return { isValid: false };
        }

        const data: LeaderboardCacheData = JSON.parse(cachedData);

        // Check if cache has expired
        const isExpired = Date.now() - data.timestamp > maxAge;

        if (isExpired) {
            clearLeaderboard(key);
            return { isValid: false };
        }

        // Validate data structure
        if (
            !Array.isArray(data.entries) ||
            !data.metadata ||
            typeof data.timestamp !== "number"
        ) {
            clearLeaderboard(key);
            return { isValid: false };
        }

        return { isValid: true, data };
    } catch (error) {
        console.warn(`Failed to load leaderboard cache for ${key}:`, error);
        clearLeaderboard(key);
        return { isValid: false };
    }
};

const clearLeaderboard = (key: string): void => {
    try {
        localStorage.removeItem(getCacheKey(key));
    } catch (error) {
        console.warn(`Failed to clear leaderboard cache for ${key}:`, error);
    }
};

const isLeaderboardExpired = (key: string, maxAge: number): boolean => {
    const result = loadLeaderboard(key, maxAge);
    return !result.isValid;
};

const cacheLeaderboard = async (
    key: string,
    options: { preloadImages?: boolean } = {}
): Promise<boolean> => {
    try {
        const leaderboardData = await fetchLeaderboard(key);

        if (!leaderboardData) {
            return false;
        }

        // Save to localStorage
        saveLeaderboard(key, leaderboardData);

        // Preload images if requested
        if (options.preloadImages && leaderboardData.entries.length > 0) {
            // Don't await - let images preload in background
            preloadLeaderboardImages(leaderboardData.entries).catch((error) => {
                console.warn(
                    `Failed to preload images for leaderboard ${key}:`,
                    error
                );
            });
        }

        return true;
    } catch (error) {
        console.error(`Failed to cache leaderboard ${key}:`, error);
        return false;
    }
};

const cacheMultipleLeaderboards = async (
    keys: string[],
    options: { preloadImages?: boolean } = {}
): Promise<{ success: string[]; failed: string[] }> => {
    const results = await Promise.allSettled(
        keys.map((key) => cacheLeaderboard(key, options))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === "fulfilled" && result.value) {
            success.push(key);
        } else {
            failed.push(key);
        }
    });

    return { success, failed };
};

const clearAllLeaderboards = (): void => {
    try {
        // Get all localStorage keys that match our leaderboard pattern
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("hotlympics_leaderboard_")) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.warn("Failed to clear all leaderboard caches:", error);
    }
};

export const leaderboardCacheService = {
    fetchLeaderboard,
    saveLeaderboard,
    loadLeaderboard,
    clearLeaderboard,
    isLeaderboardExpired,
    cacheLeaderboard,
    cacheMultipleLeaderboards,
    clearAllLeaderboards,
};
