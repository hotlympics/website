import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    ImageData,
    imageQueueService,
} from "../../services/core/image-queue-service.js";
import { ratingService } from "../../services/core/rating-service.js";
import { viewingPreferenceService } from "../../services/core/viewing-preference-service.js";
import { useAuth } from "../auth/use-auth.js";

export interface RatingQueueState {
    imagePair: ImageData[] | null;
    loadingImages: boolean;
    error: string | null;
}

export const useRatingQueue = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitialized = useRef(false);
    const isInitializing = useRef(false);
    const currentGender = useRef<"male" | "female">("female");
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
            currentGender.current = gender;

            // Initialize the queue service - it will check cache internally
            await imageQueueService.initialize(gender);

            // Get the first pair
            const firstPair = imageQueueService.getCurrentPair();

            if (firstPair) {
                setImagePair(firstPair);
                isInitialized.current = true;
            } else {
                setError("No images available for rating at this time.");
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
        // Wait for auth to finish loading
        if (user === undefined) {
            return;
        }

        // Initialize only once when component mounts
        if (!isInitialized.current && !isInitializing.current) {
            initializeQueue();
        }
    }, [user, initializeQueue]);

    // Handle cache saving when navigating away from homepage
    useEffect(() => {
        return () => {
            // Save cache when component unmounts and we were on homepage
            if (isHomePage && isInitialized.current) {
                imageQueueService.saveQueueToCache();
            }
        };
    }, [isHomePage, user?.uid]);

    // Clear cache if user changes or if not on homepage
    useEffect(() => {
        if (!isHomePage) {
            // Start cache timer when leaving homepage
            // We don't clear immediately, we let the cache service handle expiry
        }
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
