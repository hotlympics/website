import { userCacheService } from "./user-cache-service.js";
import { preferenceCacheService, type ViewingPreferences } from "./preference-cache-service.js";

/**
 * Service for managing viewing preferences (gender, age ranges, location filters, etc.)
 * Coordinates between user data and cached preferences for optimal performance
 */

/**
 * Get the gender preference for viewing images
 * Priority:
 * 1. Cached viewing preferences (if valid)
 * 2. Derive from user's gender (opposite gender)
 * 3. Default to "female" for anonymous users
 */
const getViewingGender = async (): Promise<"male" | "female"> => {
    // Check preference cache first
    const preferenceResult = preferenceCacheService.loadCache();
    if (preferenceResult.isValid && preferenceResult.data) {
        return preferenceResult.data.preferences.showGender;
    }

    // No valid preferences cache - derive from user data
    const user = await userCacheService.getCurrentUser();
    
    let derivedGender: "male" | "female" = "female"; // Default for anonymous users
    
    if (user && user.gender !== "unknown") {
        // Show opposite gender to user's gender
        derivedGender = user.gender === "male" ? "female" : "male";
    }

    // Cache the derived preference
    const preferences: ViewingPreferences = {
        showGender: derivedGender
    };
    preferenceCacheService.saveCache(preferences);

    return derivedGender;
};

/**
 * Update viewing preferences (e.g., gender, age ranges, location filters)
 */
const setViewingPreferences = (preferences: ViewingPreferences): void => {
    preferenceCacheService.saveCache(preferences);
};

/**
 * Clear all viewing preference and user caches (called on logout/login)
 */
const clearAllCaches = (): void => {
    userCacheService.clearUserCache();
    preferenceCacheService.clearCache();
};

export const viewingPreferenceService = {
    getViewingGender,
    setViewingPreferences,
    clearAllCaches,
    
    // Re-export individual services for direct access if needed
    userCache: userCacheService,
    preferenceCache: preferenceCacheService,
};