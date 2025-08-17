import { CACHE_CONFIG } from "../../config/cache-config.js";
import { imageCacheService } from "./image.js";
import { leaderboardCacheService } from "./leaderboard.js";
import { userCacheService } from "./user.js";

type CacheType = keyof typeof CACHE_CONFIG;

// Internal state
let isRatingPagePriority = false;
let isInitialized = false;
let backgroundCachingInProgress = false;
let pendingExpiredCaches: CacheType[] = [];

/**
 * Initialize cache manager and check for expired caches
 * Should be called early in app lifecycle
 */
const initialize = async (): Promise<void> => {
    if (isInitialized) {
        return;
    }

    isInitialized = true;

    // Check which caches are expired and need refresh
    const expiredCaches = checkExpiredCaches();

    if (expiredCaches.length === 0) {
        return;
    }

    // Store pending caches instead of starting immediately
    pendingExpiredCaches = expiredCaches;

    // Start background refresh without blocking UI
    scheduleBackgroundRefresh();
};

/**
 * Set rating page priority mode to avoid interfering with critical image loading
 */
const setRatingPagePriority = (enabled: boolean): void => {
    isRatingPagePriority = enabled;

    if (!enabled && !backgroundCachingInProgress) {
        // Rating page priority lifted, safe to do more aggressive caching
        executeBackgroundCaching();
    }
};

/**
 * Called after first rating pair is displayed - now safe to do more caching
 */
const onFirstPairDisplayed = (): void => {
    isRatingPagePriority = false;
    executeBackgroundCaching();
};

/**
 * Force refresh specific caches (useful for manual cache invalidation)
 */
const refreshCaches = async (cacheTypes: CacheType[]): Promise<void> => {
    const promises = cacheTypes.map((cacheType) => refreshCache(cacheType));
    await Promise.allSettled(promises);
};

/**
 * Clear all managed caches
 */
const clearAllCaches = (): void => {
    try {
        leaderboardCacheService.clearAllLeaderboards();
        userCacheService.clearUserCache();
        imageCacheService.clearCache();
        console.log("All caches cleared successfully");
    } catch (error) {
        console.error("Error clearing caches:", error);
    }
};

/**
 * Get cache status for all managed caches
 */
const getCacheStatus = (): Record<
    CacheType,
    { expired: boolean; age?: number }
> => {
    const status = {} as Record<CacheType, { expired: boolean; age?: number }>;

    for (const [cacheType, config] of Object.entries(CACHE_CONFIG)) {
        const expired = isCacheExpired(cacheType as CacheType, config.duration);
        status[cacheType as CacheType] = { expired };

        // Add age info if cache exists
        if (!expired) {
            const age = getCacheAge(cacheType as CacheType);
            if (age !== null) {
                status[cacheType as CacheType].age = age;
            }
        }
    }

    return status;
};

// Private helper functions

const checkExpiredCaches = (): CacheType[] => {
    const expired: CacheType[] = [];

    for (const [cacheType, config] of Object.entries(CACHE_CONFIG)) {
        if (isCacheExpired(cacheType as CacheType, config.duration)) {
            expired.push(cacheType as CacheType);
        }
    }

    return expired;
};

const scheduleBackgroundRefresh = async (): Promise<void> => {
    if (isRatingPagePriority) {
        // Don't start caching while rating page priority is active
        // Caching will be triggered when priority is disabled
        return;
    }

    if (pendingExpiredCaches.length > 0) {
        // Start immediately but with low priority
        setTimeout(() => {
            if (!backgroundCachingInProgress) {
                refreshCaches(pendingExpiredCaches);
            }
        }, 100); // Small delay to not block initial render
    }
};

const executeBackgroundCaching = async (): Promise<void> => {
    if (backgroundCachingInProgress) {
        return;
    }

    // Use pending expired caches if available, otherwise check for new expired caches
    const expiredCaches =
        pendingExpiredCaches.length > 0
            ? pendingExpiredCaches
            : checkExpiredCaches();

    if (expiredCaches.length > 0) {
        await refreshCaches(expiredCaches);
        // Clear pending caches after processing
        pendingExpiredCaches = [];
    }
};

const refreshCache = async (cacheType: CacheType): Promise<void> => {
    backgroundCachingInProgress = true;

    try {
        const config = CACHE_CONFIG[cacheType];

        switch (cacheType) {
            case "leaderboards":
                if (config.keys) {
                    const result =
                        await leaderboardCacheService.cacheMultipleLeaderboards(
                            config.keys,
                            { preloadImages: config.preloadImages }
                        );

                    if (result.success.length > 0) {
                        console.log(
                            `Cached leaderboards: ${result.success.join(", ")}`
                        );
                    }

                    if (result.failed.length > 0) {
                        console.warn(
                            `Failed to cache leaderboards: ${result.failed.join(", ")}`
                        );
                    }
                }
                break;

            case "userProfiles":
                // User cache is handled automatically by the existing service
                // We could add explicit refresh logic here if needed
                break;

            default:
                console.warn(`Unknown cache type: ${cacheType}`);
        }
    } catch (error) {
        console.error(`Failed to refresh cache ${cacheType}:`, error);
    } finally {
        backgroundCachingInProgress = false;
    }
};

const isCacheExpired = (cacheType: CacheType, duration: number): boolean => {
    const config = CACHE_CONFIG[cacheType];

    switch (cacheType) {
        case "leaderboards":
            if (config.keys && config.keys.length > 0) {
                // Check if any of the configured leaderboards are expired
                return config.keys.some((key) =>
                    leaderboardCacheService.isLeaderboardExpired(key, duration)
                );
            }
            return false;

        case "userProfiles": {
            // Check user cache expiration using existing service
            // The user cache service doesn't expose cache validation, so we'll assume it's handling expiration internally
            return false; // Let the existing service handle its own expiration
        }

        default:
            return true;
    }
};

const getCacheAge = (cacheType: CacheType): number | null => {
    const config = CACHE_CONFIG[cacheType];

    switch (cacheType) {
        case "leaderboards": {
            if (config.keys && config.keys.length > 0) {
                // Return age of oldest cache
                let oldestAge = 0;
                for (const key of config.keys) {
                    const result = leaderboardCacheService.loadLeaderboard(
                        key,
                        config.duration
                    );
                    if (result.isValid && result.data) {
                        const age = Date.now() - result.data.timestamp;
                        oldestAge = Math.max(oldestAge, age);
                    }
                }
                return oldestAge;
            }
            return null;
        }

        case "userProfiles": {
            // User cache service doesn't expose cache age, return null
            return null;
        }

        default:
            return null;
    }
};

// Export functional service object
export const cacheManager = {
    initialize,
    setRatingPagePriority,
    onFirstPairDisplayed,
    refreshCaches,
    clearAllCaches,
    getCacheStatus,
};
