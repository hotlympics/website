import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    ImageData,
    imageQueueService,
} from "../../services/core/image-queue-service.js";
import { ratingService } from "../../services/core/rating-service.js";
import { userService } from "../../services/core/user-service.js";
import { useAuth } from "../auth/use-auth.js";
import { AuthUser } from "../../services/auth/firebase-auth.js";

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
    const lastUserId = useRef<string | null>(null);
    const currentGender = useRef<"male" | "female">("female");
    const hasInitializedOnce = useRef(false); // Track if we've ever initialized
    const isHomePage = location.pathname === "/";

    const initializeQueue = useCallback(async (forceUser?: AuthUser | null) => {
        const currentUser = forceUser !== undefined ? forceUser : user;
        
        if (isInitialized.current || isInitializing.current) {
            return;
        }

        isInitializing.current = true;
        setLoadingImages(true);
        setError(null);

        try {
            // Determine desired gender preference
            let gender: "male" | "female" = "female";

            if (currentUser) {
                const userDetails = await userService.getCurrentUser();
                if (userDetails && userDetails.gender !== "unknown") {
                    gender = userDetails.gender === "male" ? "female" : "male";
                }
            }

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
    }, [user]);

    useEffect(() => {
        // Handle different auth states:
        // user === undefined: Auth still loading
        // user === null: User logged out  
        // user === object: User logged in
        
        const currentUserId = user?.uid || null;
        
        // Wait for auth to finish loading
        if (user === undefined) {
            return;
        }
        
        // Initialize if user changed OR if this is the first time we're running
        const userChanged = currentUserId !== lastUserId.current;
        const isFirstRun = !hasInitializedOnce.current;
        
        if (userChanged || isFirstRun) {
            // Clear cache when user changes (but not on first run)
            if (userChanged && !isFirstRun) {
                console.log("User changed - clearing cache");
                imageQueueService.clearQueueCache();
            }
            
            lastUserId.current = currentUserId;
            hasInitializedOnce.current = true;
            isInitialized.current = false;
            isInitializing.current = false;
            
            // Reset UI state when user logs out
            if (userChanged && currentUserId === null) {
                setImagePair(null);
                setError(null);
                setLoadingImages(true);
            }
            
            // Initialize for both authenticated and unauthenticated users
            initializeQueue(user);
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
            // Start cache timer when leaving homepage - cache will expire after 1 minute
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
