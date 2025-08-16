import { userCacheService } from "./user.js";

const PREFERENCE_CACHE_KEY = "hotlympics_preferences";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

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

// Cache operations
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

/**
 * Service for managing viewing preferences (gender, age ranges, location filters, etc.)
 * Coordinates between user data and cached preferences for optimal performance
 */

/**
 * Initialize viewing preferences from user data if not already set
 * This should be called before getViewingGender to ensure preferences exist
 */
const initializeViewingPreferences = async (): Promise<void> => {
    // Check if preferences already exist and are valid
    const existingPrefs = loadCache();
    if (existingPrefs.isValid) {
        return; // Already initialized
    }

    // Get user data (will check cache first, then fetch from server)
    const user = await userCacheService.getCurrentUser();

    // Derive gender preference from user data
    let derivedGender: "male" | "female" = "female"; // Default for anonymous users

    if (user && user.gender !== "unknown") {
        // Show opposite gender to user's gender
        derivedGender = user.gender === "male" ? "female" : "male";
    }

    // Set the initial preferences
    const preferences: ViewingPreferences = {
        showGender: derivedGender,
    };
    saveCache(preferences);
};

/**
 * Get the gender preference for viewing images
 * Preferences must be initialized first via initializeViewingPreferences()
 */
const getViewingGender = async (): Promise<"male" | "female"> => {
    // Only check preference cache - no user derivation logic here
    const preferenceResult = loadCache();

    if (preferenceResult.isValid && preferenceResult.data) {
        return preferenceResult.data.preferences.showGender;
    }

    // If no preferences, this is an error - they should be initialized first
    throw new Error(
        "Viewing preferences not initialized. Call initializeViewingPreferences() first."
    );
};

/**
 * Update viewing preferences (e.g., gender, age ranges, location filters)
 */
const setViewingPreferences = (preferences: ViewingPreferences): void => {
    saveCache(preferences);
};

export const viewingPreferenceService = {
    initializeViewingPreferences,
    getViewingGender,
    setViewingPreferences,
    clearCache,
};
