import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";
import PerformanceMonitor from "../shared/performance-monitor.js";
import { useRating } from "../../hooks/rating/use-rating.js";
import ImagesCard from "./images-card.js";

export const RatingArena = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const {
        imagePair,
        loadingImages,
        error,
        fetchImagePair,
        handleImageClick,
    } = useRating();

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
                    <ImagesCard ImagePair={imagePair} handleImageClick={handleImageClick} />
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
