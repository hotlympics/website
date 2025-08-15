import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "../config/firebase.js";
import { leaderboardCacheService, type LeaderboardDocument, type LeaderboardGlobalMeta } from "../cache/leaderboard.js";

const db = getFirestore(app);

/**
 * Fetch a single leaderboard document from Firestore
 */
const fetchLeaderboard = async (key: string): Promise<LeaderboardDocument | null> => {
    try {
        const docRef = doc(db, "leaderboards", key);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.warn(`Leaderboard document not found: ${key}`);
            return null;
        }
        
        const data = docSnap.data() as LeaderboardDocument;
        return data;
    } catch (error) {
        console.error(`Error fetching leaderboard ${key}:`, error);
        return null;
    }
};

/**
 * Fetch multiple leaderboard documents from Firestore
 */
const fetchLeaderboards = async (keys: string[]): Promise<Record<string, LeaderboardDocument>> => {
    const results: Record<string, LeaderboardDocument> = {};
    
    // Fetch all leaderboards in parallel
    const promises = keys.map(async (key) => {
        const leaderboard = await fetchLeaderboard(key);
        if (leaderboard) {
            results[key] = leaderboard;
        }
    });
    
    await Promise.all(promises);
    return results;
};

/**
 * Fetch global metadata from Firestore
 */
const fetchGlobalMetadata = async (): Promise<LeaderboardGlobalMeta | null> => {
    try {
        const docRef = doc(db, "leaderboards_meta", "global");
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.warn("Global leaderboard metadata not found");
            return null;
        }
        
        const data = docSnap.data() as LeaderboardGlobalMeta;
        return data;
    } catch (error) {
        console.error("Error fetching global metadata:", error);
        return null;
    }
};

/**
 * Fetch and cache all leaderboard data
 * This is the main function for initial load caching
 */
const fetchAndCacheAll = async (keys: string[]): Promise<boolean> => {
    try {
        // Check cache first
        const cacheResult = leaderboardCacheService.loadCache();
        if (cacheResult.isValid && cacheResult.data) {
            console.log("Leaderboard data loaded from cache");
            return true;
        }
        
        console.log("Fetching fresh leaderboard data from Firestore");
        
        // Fetch leaderboards and metadata in parallel
        const [leaderboards, globalMeta] = await Promise.all([
            fetchLeaderboards(keys),
            fetchGlobalMetadata(),
        ]);
        
        if (!globalMeta) {
            console.error("Failed to fetch global metadata");
            return false;
        }
        
        // Validate that we got all requested leaderboards
        const missingKeys = keys.filter(key => !leaderboards[key]);
        if (missingKeys.length > 0) {
            console.warn("Missing leaderboards:", missingKeys);
        }
        
        // Cache the results
        leaderboardCacheService.saveCache(leaderboards, globalMeta);
        
        console.log(`Cached ${Object.keys(leaderboards).length} leaderboards`);
        return true;
    } catch (error) {
        console.error("Error fetching and caching leaderboard data:", error);
        return false;
    }
};

/**
 * Get a leaderboard, trying cache first then fetching if needed
 */
const getLeaderboard = async (key: string): Promise<LeaderboardDocument | null> => {
    // Try cache first
    const cached = leaderboardCacheService.getLeaderboard(key);
    if (cached) {
        return cached;
    }
    
    // Fetch from Firestore
    console.log(`Cache miss for leaderboard ${key}, fetching from Firestore`);
    const leaderboard = await fetchLeaderboard(key);
    
    if (leaderboard) {
        // Update cache with this single leaderboard
        // Note: This doesn't update the full cache, just adds this item
        const existingCache = leaderboardCacheService.loadCache();
        if (existingCache.isValid && existingCache.data) {
            existingCache.data.leaderboards[key] = leaderboard;
            leaderboardCacheService.saveCache(
                existingCache.data.leaderboards,
                existingCache.data.globalMeta
            );
        }
    }
    
    return leaderboard;
};

/**
 * Get all leaderboards, trying cache first then fetching if needed
 */
const getAllLeaderboards = async (keys: string[]): Promise<Record<string, LeaderboardDocument>> => {
    // Try cache first
    const cached = leaderboardCacheService.getAllLeaderboards();
    if (cached) {
        // Filter to only requested keys
        const filtered: Record<string, LeaderboardDocument> = {};
        keys.forEach(key => {
            if (cached[key]) {
                filtered[key] = cached[key];
            }
        });
        
        // If we have all requested keys in cache, return them
        if (Object.keys(filtered).length === keys.length) {
            return filtered;
        }
    }
    
    // Cache miss or incomplete, fetch fresh data
    console.log("Cache miss for leaderboards, fetching from Firestore");
    await fetchAndCacheAll(keys);
    
    // Return from cache after fetching
    return leaderboardCacheService.getAllLeaderboards() || {};
};

/**
 * Preload images from leaderboard entries
 * This follows the same pattern as the image-queue service
 */
const preloadLeaderboardImages = async (leaderboards: Record<string, LeaderboardDocument>): Promise<void> => {
    const imageUrls: string[] = [];
    
    // Extract all image URLs from all leaderboards
    Object.values(leaderboards).forEach(leaderboard => {
        leaderboard.entries.forEach(entry => {
            if (entry.imageUrl) {
                imageUrls.push(entry.imageUrl);
            }
        });
    });
    
    if (imageUrls.length === 0) {
        return;
    }
    
    console.log(`Preloading ${imageUrls.length} leaderboard images`);
    
    // Use the same preloading utility as image-queue
    try {
        const { preloadImagesWithRetry } = await import("@/utils/image-preloader");
        await preloadImagesWithRetry(imageUrls, 2); // 2 retries for leaderboard images
        console.log("Leaderboard images preloaded successfully");
    } catch (error) {
        console.warn("Failed to preload some leaderboard images:", error);
    }
};

export const leaderboardDataService = {
    fetchAndCacheAll,
    getLeaderboard,
    getAllLeaderboards,
    preloadLeaderboardImages,
    fetchLeaderboard,
    fetchGlobalMetadata,
};