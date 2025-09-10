import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cacheManager } from "../../services/cache/cache-manager.js";
import { userCacheService } from "../../services/cache/user.js";
import {
    ImageData,
    imageQueueService,
} from "../../services/core/image-queue.js";
import { ratingService } from "../../services/core/rating.js";
import { useAuth } from "../auth/use-auth.js";

export const useRatingQueue = () => {
    const { loading } = useAuth();
    const location = useLocation();
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitialized = useRef(false);
    const isInitializing = useRef(false);
    const isHomePage = location.pathname === "/";

    // TODO: replace this eventually with a preferences object in user collection
    // so users can choose what they want to see
    const getViewingGender = async (): Promise<"male" | "female"> => {
        const user = await userCacheService.getCurrentUser();

        if (user && user.gender !== "unknown") {
            // Show opposite gender to user's gender
            return user.gender === "male" ? "female" : "male";
        }

        // Default to "female" for anonymous users or users with unknown gender
        return "female";
    };

    const initializeQueue = useCallback(async () => {
        if (isInitialized.current || isInitializing.current) {
            return;
        }

        isInitializing.current = true;
        setLoadingImages(true);
        setError(null);

        // Signal cache manager that rating page is priority
        cacheManager.setRatingPagePriority(true);

        try {
            // Get viewing gender based on user's gender (opposite gender)
            const gender = await getViewingGender();

            // Initialize the queue service with progressive loading callback
            const onFirstPairReady = (firstPair: ImageData[]) => {
                // Show first pair immediately when ready
                setImagePair(firstPair);
                setLoadingImages(false);
                isInitialized.current = true;

                // Signal cache manager that first pair is displayed - safe for background caching
                cacheManager.onFirstPairDisplayed();
            };

            // Initialize the queue service - it will check cache internally
            await imageQueueService.initialize(gender, onFirstPairReady);

            // If no callback was triggered (e.g., cache hit with full preload), get first pair normally
            if (!isInitialized.current) {
                const firstPair = imageQueueService.getCurrentPair();
                if (firstPair) {
                    setImagePair(firstPair);
                    isInitialized.current = true;

                    // Signal cache manager that first pair is displayed
                    cacheManager.onFirstPairDisplayed();
                } else {
                    setError("No images available for rating at this time.");
                }
            }
        } catch (err) {
            console.error("Error initializing image queue:", err);
            setError("Failed to load images. Please try again: " + err);

            // Clear rating page priority on error to allow background caching
            cacheManager.setRatingPagePriority(false);
        } finally {
            setLoadingImages(false);
            isInitializing.current = false;
        }
    }, []);

    useEffect(() => {
        // Wait for auth to finish loading before starting image load
        if (loading) {
            return;
        }

        // Initialize only once when component mounts
        if (!isInitialized.current && !isInitializing.current) {
            initializeQueue();
        }
    }, [loading, initializeQueue]);

    // Handle cache saving when navigating away from homepage
    useEffect(() => {
        return () => {
            // Save cache when component unmounts and we were on homepage
            if (isHomePage && isInitialized.current) {
                imageQueueService.saveQueueToCache();
            }
        };
    }, [isHomePage]);

    const handleImageClick = async (selectedImage: ImageData) => {
        if (!imagePair || imagePair.length !== 2) return;

        const winnerId = selectedImage.imageId;
        const loser = imagePair.find((img) => img.imageId !== winnerId);

        if (!loser) return;

        const loserId = loser.imageId;

        // Submit rating to server (non-blocking)
        ratingService.submitRating(winnerId, loserId).catch((err) => {
            console.error("Failed to submit rating:", err);
        });

        // Immediately show next pair (seamless transition)
        const nextPair = imageQueueService.getNextPair();

        if (nextPair) {
            setImagePair(nextPair);
            setError(null);
        } else {
            // Queue exhausted, need to reinitialize
            setLoadingImages(true);
            isInitialized.current = false;
            await initializeQueue();
        }
    };

    const handleDiscardPair = async () => {
        if (!imagePair || imagePair.length !== 2) return;

        // Discard current pair without voting and get next pair
        const nextPair = imageQueueService.getNextPair();

        if (nextPair) {
            setImagePair(nextPair);
            setError(null);
        } else {
            // Queue exhausted, need to reinitialize
            setLoadingImages(true);
            isInitialized.current = false;
            await initializeQueue();
        }
    };

    return {
        imagePair,
        loadingImages,
        error,
        handleImageClick,
        handleDiscardPair,
    };
};
