import { ImageData } from "./image-queue-service.js";

const CACHE_KEY = "hotlympics_image_cache";
const CACHE_DURATION_MS = 60 * 1000; // 1 minute

export interface ImageCacheData {
    activeBlock: ImageData[];
    bufferBlock: ImageData[];
    currentIndex: number;
    timestamp: number;
}

export interface CacheValidationResult {
    isValid: boolean;
    data?: ImageCacheData;
}

const saveCache = (
    activeBlock: ImageData[],
    bufferBlock: ImageData[],
    currentIndex: number
): void => {
    try {
        const cacheData: ImageCacheData = {
            activeBlock,
            bufferBlock,
            currentIndex,
            timestamp: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn("Failed to save image cache:", error);
    }
};

const loadCache = (): CacheValidationResult => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) {
            return { isValid: false };
        }

        const data: ImageCacheData = JSON.parse(cachedData);
        
        // Check if cache has expired
        const isExpired = Date.now() - data.timestamp > CACHE_DURATION_MS;
        if (isExpired) {
            clearCache();
            return { isValid: false };
        }

        // Validate data structure
        if (
            !Array.isArray(data.activeBlock) ||
            !Array.isArray(data.bufferBlock) ||
            typeof data.currentIndex !== "number" ||
            !data.timestamp
        ) {
            clearCache();
            return { isValid: false };
        }

        return { isValid: true, data };
    } catch (error) {
        console.warn("Failed to load image cache:", error);
        clearCache();
        return { isValid: false };
    }
};

const clearCache = (): void => {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (error) {
        console.warn("Failed to clear image cache:", error);
    }
};

// Get cache data if valid, otherwise return null
const getValidCache = (): ImageCacheData | null => {
    const result = loadCache();
    return result.isValid ? result.data || null : null;
};

const getCacheAge = (): number | null => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) {
            return null;
        }

        const data: ImageCacheData = JSON.parse(cachedData);
        return Date.now() - data.timestamp;
    } catch {
        return null;
    }
};

export const imageCacheService = {
    saveCache,
    loadCache,
    clearCache,
    getValidCache,
    getCacheAge,
    CACHE_DURATION_MS,
};