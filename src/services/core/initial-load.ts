import { 
    INITIAL_LOAD_CACHE_CONFIG, 
    getServicesByStrategy, 
    getServicesByPriority,
    type CacheExecutionStrategy 
} from "../../config/initial-load-cache.js";
import { leaderboardDataService } from "../leaderboard/data.js";

/**
 * Service that orchestrates initial load caching based on configuration
 * Extensible to support multiple services in the future
 */

interface InitialLoadResult {
    success: boolean;
    servicesProcessed: string[];
    errors: Record<string, string>;
    duration: number;
}

export type { InitialLoadResult };

/**
 * Process a single service's caching requirements
 */
const processService = async (serviceKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
        switch (serviceKey) {
            case "leaderboards":
                return await processLeaderboardService();
            
            // Future services can be added here:
            // case "user_profiles":
            //     return await processUserProfileService();
            
            default:
                return { success: false, error: `Unknown service: ${serviceKey}` };
        }
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
};

/**
 * Process leaderboard service caching
 */
const processLeaderboardService = async (): Promise<{ success: boolean; error?: string }> => {
    const config = INITIAL_LOAD_CACHE_CONFIG.find(c => c.serviceKey === "leaderboards");
    if (!config || !config.enabled) {
        return { success: false, error: "Leaderboard service not configured or disabled" };
    }

    // Get leaderboard collection config
    const leaderboardCollection = config.firestoreCollections.find(c => c.name === "leaderboards");
    if (!leaderboardCollection) {
        return { success: false, error: "Leaderboard collection not configured" };
    }

    // Fetch and cache leaderboard data
    const success = await leaderboardDataService.fetchAndCacheAll(leaderboardCollection.documentKeys);
    if (!success) {
        return { success: false, error: "Failed to fetch and cache leaderboard data" };
    }

    // Preload images if configured
    if (leaderboardCollection.imageFields && leaderboardCollection.imageFields.length > 0) {
        const leaderboards = await leaderboardDataService.getAllLeaderboards(leaderboardCollection.documentKeys);
        await leaderboardDataService.preloadLeaderboardImages(leaderboards);
    }

    return { success: true };
};

/**
 * Execute caching for services with a specific strategy
 */
const executeServicesWithStrategy = async (strategy: CacheExecutionStrategy): Promise<InitialLoadResult> => {
    const startTime = Date.now();
    const services = getServicesByStrategy(strategy);
    const result: InitialLoadResult = {
        success: true,
        servicesProcessed: [],
        errors: {},
        duration: 0,
    };

    if (services.length === 0) {
        result.duration = Date.now() - startTime;
        return result;
    }

    console.log(`Executing ${strategy} caching for ${services.length} services`);

    // For background/deferred strategies, respect delays and priorities
    if (strategy === "background" || strategy === "deferred") {
        // Sort by priority and handle delays
        const sortedServices = services.sort((a, b) => a.priority - b.priority);
        
        for (const config of sortedServices) {
            // Apply delay if specified
            if (config.delayMs && config.delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, config.delayMs));
            }

            const serviceResult = await processService(config.serviceKey);
            
            if (serviceResult.success) {
                result.servicesProcessed.push(config.serviceKey);
                console.log(`✓ ${config.displayName} cached successfully (${strategy})`);
            } else {
                result.success = false;
                result.errors[config.serviceKey] = serviceResult.error || "Unknown error";
                console.error(`✗ ${config.displayName} failed (${strategy}):`, serviceResult.error);
            }
        }
    } else {
        // For immediate strategy, process in parallel for speed
        const servicePromises = services.map(async (config) => {
            const serviceResult = await processService(config.serviceKey);
            
            if (serviceResult.success) {
                result.servicesProcessed.push(config.serviceKey);
                console.log(`✓ ${config.displayName} cached successfully (${strategy})`);
            } else {
                result.success = false;
                result.errors[config.serviceKey] = serviceResult.error || "Unknown error";
                console.error(`✗ ${config.displayName} failed (${strategy}):`, serviceResult.error);
            }
        });

        await Promise.all(servicePromises);
    }

    result.duration = Date.now() - startTime;
    return result;
};

/**
 * Check if caching is needed for services with a specific strategy
 */
const shouldExecuteStrategy = async (strategy: CacheExecutionStrategy): Promise<boolean> => {
    const services = getServicesByStrategy(strategy);
    
    if (services.length === 0) {
        return false;
    }

    // Check if any service needs fresh data (cache miss/expired)
    for (const config of services) {
        const needsExecution = await shouldServiceExecute(config.serviceKey);
        if (needsExecution) {
            return true;
        }
    }

    return false;
};

/**
 * Check if a specific service needs to execute
 */
const shouldServiceExecute = async (serviceKey: string): Promise<boolean> => {
    switch (serviceKey) {
        case "leaderboards": {
            try {
                const { leaderboardCacheService } = await import("../cache/leaderboard.js");
                const cacheResult = leaderboardCacheService.loadCache();
                return !cacheResult.isValid;
            } catch {
                return true; // If we can't check cache, assume we need to execute
            }
        }
        
        // Future services can add their own cache checks here
        default:
            return true;
    }
};

/**
 * Initialize immediate caching only (critical path)
 * This should be called synchronously during app startup
 */
const initializeImmediate = async (): Promise<InitialLoadResult> => {
    console.log("Initializing immediate caching...");
    
    const needsExecution = await shouldExecuteStrategy("immediate");
    if (!needsExecution) {
        console.log("No immediate caching needed");
        return {
            success: true,
            servicesProcessed: [],
            errors: {},
            duration: 0,
        };
    }

    return await executeServicesWithStrategy("immediate");
};

/**
 * Initialize deferred caching (after critical resources are loaded)
 * This should be called after the main UI is ready
 */
const initializeDeferred = async (): Promise<InitialLoadResult> => {
    console.log("Initializing deferred caching...");
    
    const needsExecution = await shouldExecuteStrategy("deferred");
    if (!needsExecution) {
        console.log("No deferred caching needed");
        return {
            success: true,
            servicesProcessed: [],
            errors: {},
            duration: 0,
        };
    }

    return await executeServicesWithStrategy("deferred");
};

/**
 * Initialize background caching (non-blocking)
 * This can be called and forgotten - it won't block anything
 */
const initializeBackground = (): Promise<InitialLoadResult> => {
    console.log("Initializing background caching...");
    
    // Execute in background, don't wait for completion in the calling code
    return executeServicesWithStrategy("background").catch(error => {
        console.error("Background caching failed:", error);
        return {
            success: false,
            servicesProcessed: [],
            errors: { background: error.message },
            duration: 0,
        };
    });
};

/**
 * Initialize caching system with proper prioritization
 * This is the main entry point that should be called on app startup
 */
const initialize = async (): Promise<{
    immediate: InitialLoadResult;
    deferred: Promise<InitialLoadResult>;
    background: Promise<InitialLoadResult>;
}> => {
    console.log("Initializing prioritized caching system...");
    
    // 1. Execute immediate caching first (blocks startup if needed)
    const immediateResult = await initializeImmediate();
    
    // 2. Start deferred caching (returns promise, caller can await if needed)
    const deferredPromise = initializeDeferred();
    
    // 3. Start background caching (fire and forget)
    const backgroundPromise = initializeBackground();
    
    return {
        immediate: immediateResult,
        deferred: deferredPromise,
        background: backgroundPromise,
    };
};

/**
 * Force refresh all caches regardless of their current state
 */
const forceRefresh = async (): Promise<InitialLoadResult> => {
    console.log("Force refreshing all caches...");
    
    // Clear all caches first
    const allServices = getServicesByPriority();
    for (const config of allServices) {
        switch (config.serviceKey) {
            case "leaderboards": {
                const { leaderboardCacheService } = await import("../cache/leaderboard.js");
                leaderboardCacheService.clearCache();
                break;
            }
            
            // Future services can add their own cache clearing here
        }
    }

    // Execute all strategies in order
    const immediateResult = await executeServicesWithStrategy("immediate");
    const deferredResult = await executeServicesWithStrategy("deferred");
    const backgroundResult = await executeServicesWithStrategy("background");

    // Combine results
    return {
        success: immediateResult.success && deferredResult.success && backgroundResult.success,
        servicesProcessed: [
            ...immediateResult.servicesProcessed,
            ...deferredResult.servicesProcessed,
            ...backgroundResult.servicesProcessed,
        ],
        errors: {
            ...immediateResult.errors,
            ...deferredResult.errors,
            ...backgroundResult.errors,
        },
        duration: immediateResult.duration + deferredResult.duration + backgroundResult.duration,
    };
};

export const initialLoadService = {
    initialize,
    initializeImmediate,
    initializeDeferred,
    initializeBackground,
    forceRefresh,
    executeServicesWithStrategy,
};