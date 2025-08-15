/**
 * Cache service for leaderboard data
 * Follows the same patterns as other cache services (image, user, preferences)
 */

export interface LeaderboardEntry {
    imageId: string;
    imageUrl: string;
    userId: string;
    rating: number;
    gender: "male" | "female";
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    dateOfBirth: string; // ISO date string
}

export interface LeaderboardMetadata {
    generatedAt: string; // ISO date string
    version: number;
    updateCount: number;
    firstGeneratedAt: string; // ISO date string
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

export interface LeaderboardGlobalMeta {
    lastGeneratedAt: string; // ISO date string
    configVersion: number;
    leaderboardCount: number;
    generatorInfo: {
        lastRunStatus: "success" | "error";
        leaderboardsProcessed: number;
        error?: string;
    };
}

export interface LeaderboardCacheData {
    leaderboards: Record<string, LeaderboardDocument>; // key -> document
    globalMeta: LeaderboardGlobalMeta;
    timestamp: number;
}

export interface CacheValidationResult {
    isValid: boolean;
    data?: LeaderboardCacheData;
}

const CACHE_KEY = "hotlympics_leaderboard_cache";
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes (matches server regeneration interval)

const saveCache = (
    leaderboards: Record<string, LeaderboardDocument>,
    globalMeta: LeaderboardGlobalMeta
): void => {
    try {
        const cacheData: LeaderboardCacheData = {
            leaderboards,
            globalMeta,
            timestamp: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn("Failed to save leaderboard cache:", error);
    }
};

const loadCache = (): CacheValidationResult => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (!cachedData) {
            return { isValid: false };
        }

        const data: LeaderboardCacheData = JSON.parse(cachedData);

        // Check if cache has expired
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION_MS;

        if (isExpired) {
            clearCache();
            return { isValid: false };
        }

        // Validate data structure
        if (
            !data.leaderboards ||
            typeof data.leaderboards !== "object" ||
            !data.globalMeta ||
            typeof data.globalMeta !== "object" ||
            !data.timestamp
        ) {
            clearCache();
            return { isValid: false };
        }

        // Validate leaderboard structure
        for (const [key, leaderboard] of Object.entries(data.leaderboards)) {
            if (
                !Array.isArray(leaderboard.entries) ||
                !leaderboard.metadata ||
                typeof leaderboard.metadata !== "object"
            ) {
                console.warn(`Invalid leaderboard structure for key: ${key}`);
                clearCache();
                return { isValid: false };
            }
        }

        return { isValid: true, data };
    } catch (error) {
        console.warn("Failed to load leaderboard cache:", error);
        clearCache();
        return { isValid: false };
    }
};

const clearCache = (): void => {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (error) {
        console.warn("Failed to clear leaderboard cache:", error);
    }
};

/**
 * Get a specific leaderboard from cache
 */
const getLeaderboard = (key: string): LeaderboardDocument | null => {
    const cacheResult = loadCache();
    if (!cacheResult.isValid || !cacheResult.data) {
        return null;
    }

    return cacheResult.data.leaderboards[key] || null;
};

/**
 * Get all leaderboards from cache
 */
const getAllLeaderboards = (): Record<string, LeaderboardDocument> | null => {
    const cacheResult = loadCache();
    if (!cacheResult.isValid || !cacheResult.data) {
        return null;
    }

    return cacheResult.data.leaderboards;
};

/**
 * Get global metadata from cache
 */
const getGlobalMetadata = (): LeaderboardGlobalMeta | null => {
    const cacheResult = loadCache();
    if (!cacheResult.isValid || !cacheResult.data) {
        return null;
    }

    return cacheResult.data.globalMeta;
};

export const leaderboardCacheService = {
    saveCache,
    loadCache,
    clearCache,
    getLeaderboard,
    getAllLeaderboards,
    getGlobalMetadata,
    CACHE_DURATION_MS,
};