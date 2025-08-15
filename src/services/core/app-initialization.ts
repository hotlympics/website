import { imageQueueService } from "../core/image-queue.js";
import { initialLoadService, type InitialLoadResult } from "../core/initial-load.js";

/**
 * Coordinated initialization service that ensures proper priority:
 * 1. Critical rating page images first
 * 2. Then background/deferred caching
 */

interface AppInitializationResult {
    ratingImagesReady: boolean;
    immediateCache: InitialLoadResult;
    deferredCache: Promise<InitialLoadResult>;
    backgroundCache: Promise<InitialLoadResult>;
}

/**
 * Initialize the app with proper priority handling
 * This ensures rating page images are always loaded first
 */
const initializeApp = async (initialGender: "male" | "female" = "female"): Promise<AppInitializationResult> => {
    console.log("🚀 Starting prioritized app initialization...");

    // STEP 1: Initialize critical rating images first (highest priority)
    console.log("📸 Loading critical rating images...");
    let ratingImagesReady = false;
    try {
        await imageQueueService.initialize(initialGender);
        ratingImagesReady = true;
        console.log("✅ Critical rating images loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load critical rating images:", error);
        ratingImagesReady = false;
    }

    // STEP 2: Start caching system (background/deferred won't block)
    console.log("💾 Starting background caching system...");
    const cacheResults = await initialLoadService.initialize();

    console.log("🎉 App initialization complete!");

    return {
        ratingImagesReady,
        immediateCache: cacheResults.immediate,
        deferredCache: cacheResults.deferred,
        backgroundCache: cacheResults.background,
    };
};

/**
 * Initialize app but wait for deferred caching to complete
 * Use this if you need to ensure deferred caching is done before proceeding
 */
const initializeAppWithDeferred = async (initialGender: "male" | "female" = "female"): Promise<AppInitializationResult> => {
    const result = await initializeApp(initialGender);

    // Wait for deferred caching to complete
    await result.deferredCache;

    return result;
};

/**
 * Check if critical images are ready for rating
 */
const isRatingReady = (): boolean => {
    try {
        const currentPair = imageQueueService.getCurrentPair();
        return currentPair !== null && currentPair.length === 2;
    } catch {
        return false;
    }
};

/**
 * Get current app readiness status
 */
const getReadinessStatus = () => {
    return {
        ratingReady: isRatingReady(),
        // Add other readiness checks here as needed
    };
};

export const appInitializationService = {
    initializeApp,
    initializeAppWithDeferred,
    isRatingReady,
    getReadinessStatus,
};
