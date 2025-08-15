const PREFERENCE_CACHE_KEY = "hotlympics_preferences";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours (was 5 minutes)

export interface ViewingPreferences {
    showGender: "male" | "female";
    // Future: ageRangeMin, ageRangeMax, location filters, etc.
}

export interface PreferenceCacheData {
    preferences: ViewingPreferences;
    timestamp: number;
}

export interface CacheValidationResult {
    isValid: boolean;
    data?: PreferenceCacheData;
}

const saveCache = (preferences: ViewingPreferences): void => {
    try {
        const cacheData: PreferenceCacheData = {
            preferences,
            timestamp: Date.now(),
        };

        localStorage.setItem(PREFERENCE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn("Failed to save preference cache:", error);
    }
};

const loadCache = (): CacheValidationResult => {
    try {
        const cachedData = localStorage.getItem(PREFERENCE_CACHE_KEY);

        if (!cachedData) {
            return { isValid: false };
        }

        const data: PreferenceCacheData = JSON.parse(cachedData);

        // Check if cache has expired
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION_MS;

        if (isExpired) {
            clearCache();
            return { isValid: false };
        }

        // Validate data structure
        if (
            !data.preferences ||
            !data.preferences.showGender ||
            !["male", "female"].includes(data.preferences.showGender) ||
            !data.timestamp
        ) {
            clearCache();
            return { isValid: false };
        }

        return { isValid: true, data };
    } catch (error) {
        console.warn("Failed to load preference cache:", error);
        clearCache();
        return { isValid: false };
    }
};

const clearCache = (): void => {
    try {
        localStorage.removeItem(PREFERENCE_CACHE_KEY);
    } catch (error) {
        console.warn("Failed to clear preference cache:", error);
    }
};

export const preferenceCacheService = {
    saveCache,
    loadCache,
    clearCache,
    CACHE_DURATION_MS,
};
