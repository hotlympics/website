import { Flag, Settings } from "lucide-react";
import { motion } from "motion/react";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ImageData } from "../../services/core/image-queue";

interface SwipeCardProps {
    pair: ImageData[];
    onComplete?: (winner: ImageData) => void;
    readOnly?: boolean;
    bare?: boolean; // Render content without its own rounded/bg/shadow
    onReportImage?: (imageData: ImageData) => void;
    onSettingsClick?: () => void;
}

export type SwipeCardHandle = {
    selectTop: () => void;
    selectBottom: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
    (
        {
            pair,
            onComplete,
            readOnly = false,
            bare = false,
            onReportImage,
            onSettingsClick,
        },
        ref
    ) => {
        const topImage = pair[0];
        const bottomImage = pair[1];

        const [exitingDir, setExitingDir] = useState<"up" | "down" | null>(
            null
        );
        const completedRef = useRef(false);
        const containerRef = useRef<HTMLDivElement | null>(null);

        // Reset internal state when a new pair arrives
        useEffect(() => {
            setExitingDir(null);
            completedRef.current = false;
        }, [topImage.imageId, bottomImage.imageId]);

        const yOffscreen = useMemo(() => {
            // Calculate an offscreen distance based on container height or viewport
            const containerH =
                containerRef.current?.getBoundingClientRect().height;
            const vh =
                typeof window !== "undefined" ? window.innerHeight : 1000;
            return Math.max(containerH ?? 0, vh) + 200;
        }, []);

        const triggerExit = useCallback(
            (dir: "up" | "down") => {
                if (exitingDir) return;
                setExitingDir(dir);
            },
            [exitingDir]
        );

        // Expose imperative API to parent for keyboard navigation
        useImperativeHandle(ref, () => ({
            selectTop: () => triggerExit("up"),
            selectBottom: () => triggerExit("down"),
        }));

        const handleDragEnd = useCallback(
            (
                _event: PointerEvent,
                info: { offset: { y: number }; velocity: { y: number } }
            ) => {
                const offsetY = info.offset.y;
                const velocityY = info.velocity.y;
                const threshold = 80; // px
                const velocityThreshold = 700; // px/s approx

                const shouldAccept =
                    Math.abs(offsetY) > threshold ||
                    Math.abs(velocityY) > velocityThreshold;
                if (!shouldAccept) {
                    setExitingDir(null);
                    return;
                }

                const dir = offsetY < 0 ? "up" : "down";
                triggerExit(dir);
            },
            [triggerExit]
        );

        const handleClickTop = useCallback(
            () => triggerExit("up"),
            [triggerExit]
        );
        const handleClickBottom = useCallback(
            () => triggerExit("down"),
            [triggerExit]
        );

        const winner =
            exitingDir === "up"
                ? topImage
                : exitingDir === "down"
                  ? bottomImage
                  : null;

        return (
            <motion.div
                ref={containerRef}
                className="relative z-10 h-full w-full"
                style={{ touchAction: "none" }}
                drag={readOnly ? false : exitingDir === null ? "y" : false}
                dragElastic={0.2}
                dragMomentum={false}
                dragSnapToOrigin
                dragTransition={{
                    bounceStiffness: 600,
                    bounceDamping: 28,
                    power: 0.2,
                    timeConstant: 250,
                }}
                onDragEnd={handleDragEnd}
                onPointerCancel={() => {}}
                whileDrag={{ scale: 0.995 }}
                initial={{ y: 0, rotate: 0, scale: 1 }}
                animate={{
                    y:
                        exitingDir === "up"
                            ? -yOffscreen
                            : exitingDir === "down"
                              ? yOffscreen
                              : 0,
                    rotate:
                        exitingDir === null ? 0 : exitingDir === "up" ? -3 : 3,
                    scale: exitingDir === null ? 1 : 0.98,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
                onAnimationComplete={() => {
                    if (exitingDir && winner && !completedRef.current) {
                        completedRef.current = true;
                        onComplete?.(winner);
                    }
                }}
            >
                {/* Card content; optionally bare (no own chrome) when parent provides frame */}
                <div
                    className={
                        bare
                            ? "flex h-full w-full flex-col"
                            : "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-gray-800 shadow-2xl"
                    }
                >
                    {/* Top image */}
                    <div className="relative w-full overflow-hidden rounded-t-2xl">
                        <button
                            type="button"
                            className="relative w-full overflow-hidden rounded-t-2xl"
                            onClick={handleClickTop}
                        >
                            <div className="aspect-square w-full">
                                <img
                                    src={topImage.imageUrl}
                                    alt="Top"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </button>

                        {/* Report flag for top image - top-left corner */}
                        {onReportImage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReportImage(topImage);
                                }}
                                className="absolute top-2 left-2 z-20 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80"
                                title="Report this image"
                            >
                                <Flag className="h-4 w-4" />
                            </button>
                        )}

                        {/* Settings cog button - top-right corner */}
                        {onSettingsClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSettingsClick();
                                }}
                                className="absolute top-2 right-2 z-20 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80"
                                title="Settings"
                            >
                                <Settings className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="h-px w-full bg-gray-600" />

                    {/* Bottom image */}
                    <div className="relative w-full overflow-hidden rounded-b-2xl">
                        <button
                            type="button"
                            className="relative w-full overflow-hidden rounded-b-2xl"
                            onClick={handleClickBottom}
                        >
                            <div className="aspect-square w-full">
                                <img
                                    src={bottomImage.imageUrl}
                                    alt="Bottom"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </button>

                        {/* Report flag for bottom image - bottom-left corner */}
                        {onReportImage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReportImage(bottomImage);
                                }}
                                className="absolute bottom-2 left-2 z-20 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80"
                                title="Report this image"
                            >
                                <Flag className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }
);
