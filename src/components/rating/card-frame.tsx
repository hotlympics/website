import { forwardRef } from "react";
import type { ImageData } from "../../services/core/image-queue.js";
import { BackgroundNextPair } from "./background-next-pair.js";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card.js";

interface CardFrameProps {
    imagePair: ImageData[];
    onComplete: (selectedImage: ImageData) => void;
    onReportImage: (imageData: ImageData) => void;
}

export const CardFrame = forwardRef<SwipeCardHandle, CardFrameProps>(
    ({ imagePair, onComplete, onReportImage }, ref) => {
        return (
            <div
                className="relative w-full"
                style={{
                    maxWidth: "min(24rem, calc((100dvh - 8rem)/2))",
                }}
            >
                <div
                    className="relative w-full overflow-hidden rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
                    style={{
                        aspectRatio: "1/2",
                    }}
                >
                    <BackgroundNextPair onReportImage={onReportImage} />

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
        );
    }
);
