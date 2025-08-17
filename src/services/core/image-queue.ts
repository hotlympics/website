import { getApiUrl } from "@/utils/api-config";
import { preloadImageWithRetry } from "@/utils/image-preloader";
import { firebaseAuthService } from "../auth/firebase-auth";
import { imageCacheService } from "../cache/image.js";

const BLOCK_SIZE = 10; // ALWAYS DIVISIBLE BY 2
const apiUrl = getApiUrl();

export interface GlickoState {
    rating: number; // Display rating R
    rd: number; // Display rating deviation RD
    volatility: number; // σ (sigma)
    mu: number; // Internal rating μ
    phi: number; // Internal deviation ϕ
    lastUpdateAt: Date; // For future inactivity logic
    systemVersion: 2;
}

export interface ImageData {
    imageId: string;
    userId: string;
    imageUrl: string;
    gender: "male" | "female";
    dateOfBirth: Date;
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    glicko: GlickoState;
    inPool: boolean;
    status?: "pending" | "active";
}

export interface ImageQueue {
    activeBlock: ImageData[];
    bufferBlock: ImageData[];
    currentIndex: number;
    preloadedImages: Map<
        string /* image URL */,
        HTMLImageElement /* image HTML object */
    >;
    gender: "male" | "female";
    isFetchingBlock: boolean; // are we already currently loading a block
    onFirstPairReady?: (block: ImageData[]) => void; // callback for when first pair is ready
}

// Create a singleton queue instance
let queueInstance: ImageQueue | null = null;

const getQueue = (): ImageQueue => {
    if (!queueInstance) {
        queueInstance = {
            activeBlock: [],
            bufferBlock: [],
            currentIndex: 0,
            preloadedImages: new Map(),
            gender: "female",
            isFetchingBlock: false,
            onFirstPairReady: undefined,
        };
    }
    return queueInstance;
};

const fetchImageBlock = async (
    gender: "male" | "female",
    count: number
): Promise<ImageData[] | null> => {
    try {
        const token = await firebaseAuthService.getIdToken();

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${apiUrl}/images/block?gender=${gender}&count=${count}`,
            {
                headers,
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch image block:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.success ? data.images : null;
    } catch (error) {
        console.error("Error fetching image block:", error);
        return null;
    }
};

const preloadBlockImages = async (
    queue: ImageQueue,
    block: ImageData[],
    onPairReady?: (readyCount: number) => void
): Promise<void> => {
    const urls = block.map((img) => img.imageUrl);
    let loadedCount = 0;

    // Load images one by one to enable progressive display
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        try {
            const result = await preloadImageWithRetry(url, 3);

            if (result.success && result.image) {
                queue.preloadedImages.set(result.url, result.image);
                loadedCount++;

                // Notify when first pair is ready for display
                if (loadedCount === 2 && onPairReady) {
                    onPairReady(loadedCount);
                }
            }
        } catch (error) {
            console.error("Error preloading image:", error);
        }
    }
};

const fetchAndPreloadNewBlock = async (queue: ImageQueue): Promise<void> => {
    if (queue.isFetchingBlock) {
        return;
    }

    queue.isFetchingBlock = true;

    try {
        const newBlock = await fetchImageBlock(queue.gender, BLOCK_SIZE);

        if (newBlock && newBlock.length > 0) {
            queue.bufferBlock = newBlock;
            await preloadBlockImages(queue, newBlock);
        }
    } catch (error) {
        console.error("Error fetching new block:", error);
    } finally {
        queue.isFetchingBlock = false;
    }
};

const rotateBlocks = (queue: ImageQueue): void => {
    // Clean up old images from memory
    queue.activeBlock.forEach((img) => {
        queue.preloadedImages.delete(img.imageUrl);
    });

    // Swap blocks
    queue.activeBlock = queue.bufferBlock;
    queue.bufferBlock = [];
    queue.currentIndex = 0;

    // Start fetching new buffer block
    if (!queue.isFetchingBlock) {
        fetchAndPreloadNewBlock(queue);
    }
};

const initialize = async (
    gender: "male" | "female",
    onFirstPairReady?: (block: ImageData[]) => void
): Promise<void> => {
    const queue = getQueue();

    // Set the callback
    queue.onFirstPairReady = onFirstPairReady;

    // Check if we have valid cache
    const cacheResult = imageCacheService.loadCache();

    if (cacheResult.isValid && cacheResult.data) {
        // Restore queue state from cache
        queue.gender = gender;
        queue.currentIndex = cacheResult.data.currentIndex;
        queue.activeBlock = cacheResult.data.activeBlock;
        queue.bufferBlock = cacheResult.data.bufferBlock;
        queue.preloadedImages.clear();
        queue.isFetchingBlock = false;

        // Preload the cached images (instant from browser cache)
        await preloadBlockImages(queue, queue.activeBlock);

        // Show current pair immediately if callback provided
        if (
            onFirstPairReady &&
            queue.activeBlock.length >= queue.currentIndex + 2
        ) {
            const currentPair = queue.activeBlock.slice(
                queue.currentIndex,
                queue.currentIndex + 2
            );
            onFirstPairReady(currentPair);
        }

        if (queue.bufferBlock.length > 0) {
            await preloadBlockImages(queue, queue.bufferBlock);
        }

        // If we're getting close to the end of activeBlock and don't have bufferBlock, start fetching
        if (
            queue.currentIndex >= queue.activeBlock.length - 4 &&
            queue.bufferBlock.length === 0
        ) {
            fetchAndPreloadNewBlock(queue);
        }

        return;
    }

    // No valid cache, proceed with normal initialization
    queue.gender = gender;
    queue.currentIndex = 0;
    queue.activeBlock = [];
    queue.bufferBlock = [];
    queue.preloadedImages.clear();

    // Fetch initial block
    const initialBlock = await fetchImageBlock(gender, BLOCK_SIZE);

    if (!initialBlock || initialBlock.length === 0) {
        throw new Error(
            "Failed to initialize image queue: No images available"
        );
    }

    queue.activeBlock = initialBlock;

    // Use progressive preloading with callback for first pair
    const onPairReady = (readyCount: number) => {
        if (
            readyCount === 2 &&
            onFirstPairReady &&
            queue.activeBlock.length >= 2
        ) {
            onFirstPairReady(queue.activeBlock.slice(0, 2));
        }
    };

    await preloadBlockImages(queue, queue.activeBlock, onPairReady);

    // Start preloading the next block immediately
    fetchAndPreloadNewBlock(queue);
};

const getNextPair = (): ImageData[] | null => {
    const queue = getQueue();

    // First increment to get the NEXT pair
    queue.currentIndex += 2;

    if (queue.currentIndex >= queue.activeBlock.length - 1) {
        // Need to rotate blocks
        rotateBlocks(queue);
    }

    if (queue.activeBlock.length < 2) {
        return null;
    }

    const pair = [
        queue.activeBlock[queue.currentIndex],
        queue.activeBlock[queue.currentIndex + 1],
    ];

    return pair;
};

const getCurrentPair = (): ImageData[] | null => {
    const queue = getQueue();

    if (
        queue.activeBlock.length < 2 ||
        queue.currentIndex >= queue.activeBlock.length - 1
    ) {
        return null;
    }

    return [
        queue.activeBlock[queue.currentIndex],
        queue.activeBlock[queue.currentIndex + 1],
    ];
};

const peekNextPair = (): ImageData[] | null => {
    const queue = getQueue();

    const nextIndex = queue.currentIndex + 2;

    if (queue.activeBlock.length < 2) {
        return null;
    }

    if (nextIndex >= queue.activeBlock.length - 1) {
        // Would rotate to buffer block
        if (queue.bufferBlock && queue.bufferBlock.length >= 2) {
            return [queue.bufferBlock[0], queue.bufferBlock[1]];
        }
        return null;
    }

    return [queue.activeBlock[nextIndex], queue.activeBlock[nextIndex + 1]];
};

const resetQueue = (): void => {
    const queue = getQueue();
    queue.activeBlock = [];
    queue.bufferBlock = [];
    queue.currentIndex = 0;
    queue.preloadedImages.clear();
    queue.isFetchingBlock = false;
    queue.gender = "female";
};

const saveQueueToCache = (): void => {
    const queue = getQueue();

    // Only save if we have meaningful data
    if (queue.activeBlock.length > 0) {
        imageCacheService.saveCache(
            queue.activeBlock,
            queue.bufferBlock,
            queue.currentIndex
        );
    }
};

const clearQueueCache = (): void => {
    imageCacheService.clearCache();
    resetQueue(); // Also reset the in-memory queue
};

export const imageQueueService = {
    initialize,
    getNextPair,
    getCurrentPair,
    peekNextPair,
    saveQueueToCache,
    clearQueueCache,
};
