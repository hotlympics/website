import { forwardRef } from "react";
import type { ImageData } from "../../services/core/image-queue.js";
import { imageQueueService } from "../../services/core/image-queue.js";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card.js";

interface CardContainerProps {
    imagePair: ImageData[];
    onComplete: (selectedImage: ImageData) => void;
    onReportImage: (imageData: ImageData) => void;
}

export const CardContainer = forwardRef<SwipeCardHandle, CardContainerProps>(
    ({ imagePair, onComplete, onReportImage }, ref) => {
        return (
            <div className="flex items-center justify-center py-2">
                <div
                    className="relative w-full"
                    style={{
                        maxWidth: "min(24rem, calc((100dvh - 160px)/2))",
                        maxHeight: "calc(100dvh - 160px)",
                    }}
                >
                    {/* Fixed shadow frame that does not move with cards */}
                    <div
                        className="relative w-full overflow-hidden rounded-2xl bg-gray-800 shadow-[0_18px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
                        style={{
                            aspectRatio: "1/2",
                            maxHeight: "calc(100dvh - 160px)",
                        }}
                    >
                        {/* Background next pair, visible from start of swipe */}
                        {(() => {
                            const nextPair = imageQueueService.peekNextPair();
                            if (!nextPair || nextPair.length !== 2) {
                                return null;
                            }
                            return (
                                <div className="absolute inset-0 z-0">
                                    <SwipeCard
                                        pair={nextPair}
                                        readOnly
                                        bare
                                        onReportImage={onReportImage}
                                    />
                                </div>
                            );
                        })()}

                        {/* Top swipeable card */}
                        <div className="absolute inset-0 z-10">
                            <SwipeCard
                                ref={ref}
                                key={`${imagePair[0].imageId}-${imagePair[1].imageId}`}
                                pair={imagePair}
                                onComplete={onComplete}
                                onReportImage={onReportImage}
                                bare
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);