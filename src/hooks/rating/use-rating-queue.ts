import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { viewingPreferenceService } from "../../services/cache/viewing-preferences.js";
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

    const initializeQueue = useCallback(async () => {
        if (isInitialized.current || isInitializing.current) {
            return;
        }

        isInitializing.current = true;
        setLoadingImages(true);
        setError(null);

        try {
            // Get viewing gender preference (uses cache when possible)
            const gender = await viewingPreferenceService.getViewingGender();

            // Initialize the queue service with progressive loading callback
            const onFirstPairReady = (firstPair: ImageData[]) => {
                // Show first pair immediately when ready
                setImagePair(firstPair);
                setLoadingImages(false);
                isInitialized.current = true;
            };

            // Initialize the queue service - it will check cache internally
            await imageQueueService.initialize(gender, onFirstPairReady);

            // If no callback was triggered (e.g., cache hit with full preload), get first pair normally
            if (!isInitialized.current) {
                const firstPair = imageQueueService.getCurrentPair();
                if (firstPair) {
                    setImagePair(firstPair);
                    isInitialized.current = true;
                } else {
                    setError("No images available for rating at this time.");
                }
            }
        } catch (err) {
            console.error("Error initializing image queue:", err);
            setError("Failed to load images. Please try again.");
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

    return {
        imagePair,
        loadingImages,
        error,
        handleImageClick,
    };
};
