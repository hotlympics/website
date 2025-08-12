import { useCallback, useEffect, useRef, useState } from "react";
import {
    ImageData,
    imageQueueService,
} from "../../services/core/image-queue-service.js";
import { ratingService } from "../../services/core/rating-service.js";
import { userService } from "../../services/core/user-service.js";
import { useAuth } from "../auth/use-auth.js";

export interface RatingQueueState {
    imagePair: ImageData[] | null;
    loadingImages: boolean;
    error: string | null;
}

export const useRatingQueue = () => {
    const { user } = useAuth();
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitialized = useRef(false);
    const isInitializing = useRef(false);
    const lastUserId = useRef<string | null>(null);
    const currentGender = useRef<"male" | "female">("female");

    const initializeQueue = useCallback(async () => {
        if (isInitialized.current || isInitializing.current) {
            return;
        }

        isInitializing.current = true;
        setLoadingImages(true);
        setError(null);

        try {
            // Determine gender preference
            let gender: "male" | "female" = "female";

            if (user) {
                const userDetails = await userService.getCurrentUser();
                if (userDetails && userDetails.gender !== "unknown") {
                    gender = userDetails.gender === "male" ? "female" : "male";
                }
            }

            currentGender.current = gender;

            // Initialize the queue service
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
    }, [user]);

    useEffect(() => {
        // Only reinitialize if user actually changed (not just auth state loading)
        const currentUserId = user?.uid || null;
        
        if (user !== undefined && currentUserId !== lastUserId.current) {
            lastUserId.current = currentUserId;
            isInitialized.current = false;
            isInitializing.current = false;
            initializeQueue();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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
