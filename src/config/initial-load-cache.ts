/**
 * Configuration for what data the website should cache on initial load
 * This config drives the initial caching strategy and can be extended for future services
 */

export interface FirestoreCollectionConfig {
    /** Name of the Firestore collection */
    name: string;
    /** Specific document keys to fetch (if empty, fetches all documents) */
    documentKeys: string[];
    /** Field paths that contain image URLs for preloading */
    imageFields?: string[];
    /** Maximum age in milliseconds before cache is considered stale */
    maxAge: number;
}

export type CacheExecutionStrategy =
    | "immediate" // Execute immediately on app start (blocks initial load)
    | "deferred" // Execute after critical resources are loaded
    | "background" // Execute in background, don't wait for completion
    | "on-demand"; // Only execute when explicitly requested

export interface InitialLoadCacheConfig {
    /** Unique identifier for this cache service */
    serviceKey: string;
    /** Human-readable name for logging/debugging */
    displayName: string;
    /** Whether this service should be cached on initial load */
    enabled: boolean;
    /** When and how this service should execute */
    executionStrategy: CacheExecutionStrategy;
    /** Priority level (1 = highest, 10 = lowest) for deferred/background execution */
    priority: number;
    /** Delay in milliseconds before starting (useful for background caching) */
    delayMs?: number;
    /** Collections to fetch from Firestore */
    firestoreCollections: FirestoreCollectionConfig[];
}

/**
 * Configuration for initial load caching
 * Each service defines what data to fetch and cache on website startup
 */
export const INITIAL_LOAD_CACHE_CONFIG: InitialLoadCacheConfig[] = [
    {
        serviceKey: "leaderboards",
        displayName: "Leaderboard Data",
        enabled: true,
        executionStrategy: "background", // Don't block initial load
        priority: 3, // Medium priority
        // delayMs: 2000, // Wait 2 seconds after app start
        firestoreCollections: [
            {
                name: "leaderboards",
                documentKeys: ["female_top", "female_bottom", "male_top", "male_bottom"],
                imageFields: ["entries[].imageUrl"], // JSONPath notation for nested arrays
                maxAge: 10 * 60 * 1000, // 10 minutes (matches server regeneration interval)
            },
            {
                name: "leaderboards_meta",
                documentKeys: ["global"],
                maxAge: 10 * 60 * 1000, // 10 minutes
            },
        ],
    },
    // Future services can be added here:
    // {
    //     serviceKey: "user_profiles",
    //     displayName: "User Profile Data", 
    //     enabled: false,
    //     executionStrategy: "deferred", // Execute after critical resources
    //     priority: 5,
    //     firestoreCollections: [
    //         {
    //             name: "users",
    //             documentKeys: [], // Empty means fetch all or use query
    //             imageFields: ["profileImageUrl", "bannerImageUrl"],
    //             maxAge: 30 * 60 * 1000, // 30 minutes
    //         }
    //     ]
    // }
];

/**
 * Get config for a specific service
 */
export const getServiceConfig = (serviceKey: string): InitialLoadCacheConfig | undefined => {
    return INITIAL_LOAD_CACHE_CONFIG.find(config => config.serviceKey === serviceKey);
};

/**
 * Get enabled services filtered by execution strategy
 */
export const getServicesByStrategy = (strategy: CacheExecutionStrategy): InitialLoadCacheConfig[] => {
    return INITIAL_LOAD_CACHE_CONFIG.filter(
        config => config.enabled && config.executionStrategy === strategy
    );
};

/**
 * Get enabled services sorted by priority (1 = highest priority)
 */
export const getServicesByPriority = (): InitialLoadCacheConfig[] => {
    return INITIAL_LOAD_CACHE_CONFIG
        .filter(config => config.enabled)
        .sort((a, b) => a.priority - b.priority);
};
