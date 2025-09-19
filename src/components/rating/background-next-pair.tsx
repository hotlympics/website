import type { ImageData } from "../../services/core/image-queue.js";
import { imageQueueService } from "../../services/core/image-queue.js";
import { SwipeCard } from "./swipe-card.js";

interface BackgroundNextPairProps {
    onReportImage: (imageData: ImageData) => void;
}

export const BackgroundNextPair = ({
    onReportImage,
}: BackgroundNextPairProps) => {
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
};
