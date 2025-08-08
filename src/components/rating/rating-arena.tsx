import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";
import { useRatingQueue } from "../../hooks/rating/use-rating-queue.js";
import { imageQueueService } from "../../services/core/image-queue-service.js";
import { SwipeCard } from "./swipe-card.js";

export const RatingArena = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const { imagePair, loadingImages, error, handleImageClick } =
        useRatingQueue();

    return (
        <div className="min-h-screen overflow-hidden bg-gray-100 p-3">
            <div className="mx-auto max-w-7xl">
                <div className="absolute top-3 right-3">
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
                <div className="mb-3 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-800">
                        Hotlympics
                    </h1>
                    <p className="text-sm text-gray-600">Pick who you prefer</p>
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
                        We encountered an error. Please refresh the page
                    </div>
                ) : imagePair && imagePair.length === 2 ? (
                    <div className="flex items-center justify-center py-2">
                        <div
                            className="relative w-full"
                            style={{
                                maxWidth: "min(24rem, calc((100vh - 140px)/2))",
                            }}
                        >
                            {/* Fixed shadow frame that does not move with cards */}
                            <div className="relative aspect-[1/2] w-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
                                {/* Background next pair, visible from start of swipe */}
                                {(() => {
                                    const nextPair =
                                        imageQueueService.peekNextPair();
                                    if (!nextPair || nextPair.length !== 2) {
                                        return null;
                                    }
                                    return (
                                        <div className="absolute inset-0 z-0">
                                            <SwipeCard
                                                pair={nextPair}
                                                readOnly
                                                bare
                                            />
                                        </div>
                                    );
                                })()}

                                {/* Top swipeable card */}
                                <div className="absolute inset-0 z-10">
                                    <SwipeCard
                                        key={`${imagePair[0].imageId}-${imagePair[1].imageId}`}
                                        pair={imagePair}
                                        onComplete={handleImageClick}
                                        bare
                                    />
                                </div>

                                {/* Static instruction overlay to avoid per-card visual shifts */}
                                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between p-3">
                                    <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                                        Swipe up = choose top
                                    </div>
                                    <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                                        Swipe down = choose bottom
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-32">
                        <p className="text-xl text-gray-600">
                            No images available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
