import { forwardRef } from "react";
import type { ImageData } from "../../services/core/image-queue.js";
import { CardFrame } from "./card-frame.js";
import type { SwipeCardHandle } from "./swipe-card.js";

interface CardContainerProps {
    imagePair: ImageData[];
    onComplete: (selectedImage: ImageData) => void;
    onReportImage: (imageData: ImageData) => void;
    onSettingsClick?: () => void;
}

export const CardContainer = forwardRef<SwipeCardHandle, CardContainerProps>(
    ({ imagePair, onComplete, onReportImage, onSettingsClick }, ref) => {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <CardFrame
                    ref={ref}
                    imagePair={imagePair}
                    onComplete={onComplete}
                    onReportImage={onReportImage}
                    onSettingsClick={onSettingsClick}
                />
            </div>
        );
    }
);
