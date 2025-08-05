import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/use-auth.js";
import { ImageData, imageService } from "../../../services/image-service.js";
import { ratingService } from "../../../services/rating-service.js";
import { userService } from "../../../services/user-service.js";

export const useRating = () => {
    const { user } = useAuth();
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setImagesLoaded] = useState({
        image1: false,
        image2: false,
    });

    useEffect(() => {
        fetchImagePair();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchImagePair = async () => {
        setLoadingImages(true);
        setError(null);

        try {
            let gender: "male" | "female" = "female"; // Default to female for non-logged in users

            if (user) {
                // Fetch user details to get their gender
                const userDetails = await userService.getCurrentUser();

                if (userDetails && userDetails.gender !== "unknown") {
                    // Show opposite gender
                    gender = userDetails.gender === "male" ? "female" : "male";
                }
            }

            const pair = await imageService.fetchImagePair(gender);

            if (pair) {
                setImagesLoaded({ image1: false, image2: false });
                setImagePair(pair);
            } else {
                setError("No images available for rating at this time.");
            }
        } catch (err) {
            console.error("Error fetching images:", err);
            setError("Failed to load images. Please try again.");
        } finally {
            setLoadingImages(false);
        }
    };

    const handleImageClick = async (selectedImage: ImageData) => {
        if (!imagePair || imagePair.length !== 2) return;

        const winnerId = selectedImage.imageId;
        const loser = imagePair.find((img) => img.imageId !== winnerId);

        if (!loser) return;

        const loserId = loser.imageId;

        // Submit rating to server
        const success = await ratingService.submitRating(winnerId, loserId);

        if (success) {
            // Fetch new pair after successful rating
            fetchImagePair();
        } else {
            setError("Failed to submit rating. Please try again.");
        }
    };

    return {
        imagePair,
        loadingImages,
        error,
        fetchImagePair,
        handleImageClick,
    };
};
