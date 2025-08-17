export interface CacheItem {
    duration: number; // How long to cache in ms
    keys?: string[]; // What keys to cache (for multi-key caches like leaderboards)
    preloadImages?: boolean; // Should images be preloaded into HTTP cache
}

export interface CacheConfig {
    leaderboards: CacheItem;
    userProfiles: CacheItem;
}

export const CACHE_CONFIG: CacheConfig = {
    leaderboards: {
        duration: 10 * 60 * 1000, // 10 minutes
        keys: ["female_top", "male_top"],
        preloadImages: true,
    },

    userProfiles: {
        duration: 2 * 60 * 60 * 1000, // 2 hours (existing duration)
    },
};
