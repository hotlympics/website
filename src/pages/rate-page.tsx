import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PerformanceMonitor from "../components/performance-monitor";
import { useAuth } from "../hooks/use-auth";
import { ImageData, imageService } from "../services/image-service";
import { ratingService } from "../services/rating-service";
import { userService } from "../services/user-service";

import ImageElement from "./components/select-image"; // Adjust the import path as necessary

const RatePage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
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

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-7xl">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => {
                            if (user) {
                                navigate("/profile");
                            } else {
                                navigate("/signin?redirect=/profile");
                            }
                        }}
                        disabled={loading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Add your photo
                    </button>
                </div>
                <div className="mb-6 text-center">
                    <h1 className="mb-6 text-4xl font-bold text-gray-800">
                        Hotlympics Rating Arena
                    </h1>
                    <p className="text-xl text-gray-600">Pick who you prefer</p>
                </div>

                {loadingImages ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="text-xl text-gray-600">
                            Loading images...
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <p className="mb-4 text-xl text-red-600">{error}</p>
                        <button
                            onClick={fetchImagePair}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : imagePair && imagePair.length === 2 ? (
                    <div className="flex flex-col items-center justify-center gap-8">
                        <ImageElement ImagePair={imagePair} top={true} onClick={handleImageClick} />
                        <ImageElement ImagePair={imagePair} top={false} onClick={handleImageClick} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-32">
                        <p className="text-xl text-gray-600">
                            No images available
                        </p>
                    </div>
                )}
            </div>
            <PerformanceMonitor />
        </div>
    );
};

export default RatePage;