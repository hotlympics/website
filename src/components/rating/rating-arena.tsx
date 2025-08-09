import { useEffect, useRef } from "react";
import { useRatingQueue } from "../../hooks/rating/use-rating-queue.js";
import { imageQueueService } from "../../services/core/image-queue-service.js";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card.js";

export const RatingArena = () => {
    const { imagePair, loadingImages, error, handleImageClick } =
        useRatingQueue();

    const cardRef = useRef<SwipeCardHandle | null>(null);

    // Keyboard navigation: ArrowUp selects top, ArrowDown selects bottom
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!imagePair || imagePair.length !== 2) return;
            if (e.key === "ArrowUp") {
                e.preventDefault();
                cardRef.current?.selectTop();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                cardRef.current?.selectBottom();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [imagePair]);

    return (
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden">
            {/* Centered content with bottom margin for MenuBar */}
            <div
                className="mt-4 flex w-full flex-grow flex-col items-center justify-center pb-24"
                style={{
                    paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
                }}
            >
                <div className="mx-auto w-full max-w-7xl px-3">
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
                                    maxWidth:
                                        "min(24rem, calc((100dvh - 140px)/2))",
                                }}
                            >
                                {/* Fixed shadow frame that does not move with cards */}
                                <div className="relative aspect-[1/2] w-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
                                    {/* Background next pair, visible from start of swipe */}
                                    {(() => {
                                        const nextPair =
                                            imageQueueService.peekNextPair();
                                        if (
                                            !nextPair ||
                                            nextPair.length !== 2
                                        ) {
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
                                            ref={cardRef}
                                            key={`${imagePair[0].imageId}-${imagePair[1].imageId}`}
                                            pair={imagePair}
                                            onComplete={handleImageClick}
                                            bare
                                        />
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
        </div>
    );
};
