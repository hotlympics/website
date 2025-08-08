import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageData } from "../../services/core/image-queue-service";

interface SwipeCardProps {
    pair: ImageData[];
    onComplete?: (winner: ImageData) => void;
    readOnly?: boolean;
    bare?: boolean; // Render content without its own rounded/bg/shadow
}

export const SwipeCard = ({
    pair,
    onComplete,
    readOnly = false,
    bare = false,
}: SwipeCardProps) => {
    const topImage = pair[0];
    const bottomImage = pair[1];

    const [exitingDir, setExitingDir] = useState<"up" | "down" | null>(null);
    const completedRef = useRef(false);
    const ref = useRef<HTMLDivElement | null>(null);

    // Reset internal state when a new pair arrives
    useEffect(() => {
        setExitingDir(null);
        completedRef.current = false;
    }, [topImage.imageId, bottomImage.imageId]);

    const yOffscreen = useMemo(() => {
        // Calculate an offscreen distance based on container height or viewport
        const containerH = ref.current?.getBoundingClientRect().height;
        const vh = typeof window !== "undefined" ? window.innerHeight : 1000;
        return Math.max(containerH ?? 0, vh) + 200;
    }, []);

    const triggerExit = useCallback(
        (dir: "up" | "down") => {
            if (exitingDir) return;
            setExitingDir(dir);
            // We don't immediately disable dragging so that Motion can resolve
            // any residual pointer state without locking out the user.
            // Drag will be effectively ignored because animate takes control.
        },
        [exitingDir]
    );

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
                // Snap back by resetting exitingDir (no-op) and keep drag enabled
                setExitingDir(null);
                return;
            }

            const dir = offsetY < 0 ? "up" : "down";
            triggerExit(dir);
        },
        [triggerExit]
    );

    const handleClickTop = useCallback(() => triggerExit("up"), [triggerExit]);
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
            ref={ref}
            className="relative z-10 h-full w-full"
            style={{ touchAction: "none" }}
            drag={readOnly ? false : exitingDir === null ? "y" : false}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 0.995 }}
            initial={{ y: 0, rotate: 0, scale: 1 }}
            animate={{
                y:
                    exitingDir === "up"
                        ? -yOffscreen
                        : exitingDir === "down"
                          ? yOffscreen
                          : 0,
                rotate: exitingDir === null ? 0 : exitingDir === "up" ? -3 : 3,
                scale: exitingDir === null ? 1 : 0.98,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onAnimationComplete={() => {
                // Only trigger on exit animations
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
                        : "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                }
            >
                <button
                    type="button"
                    className="relative w-full overflow-hidden"
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

                <div className="h-px w-full bg-gray-200" />

                <button
                    type="button"
                    className="relative w-full overflow-hidden"
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
            </div>
        </motion.div>
    );
};
