import { Minus, Plus } from "lucide-react";
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
import type { ImageData } from "../../services/core/image-queue-service";
import { reactionService } from "../../services/core/reaction-service";

interface SwipeCardProps {
    pair: ImageData[];
    onComplete?: (winner: ImageData) => void;
    readOnly?: boolean;
    bare?: boolean; // Render content without its own rounded/bg/shadow
}

export type SwipeCardHandle = {
    selectTop: () => void;
    selectBottom: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
    ({ pair, onComplete, readOnly = false, bare = false }, ref) => {
        const topImage = pair[0];
        const bottomImage = pair[1];

        const [exitingDir, setExitingDir] = useState<"up" | "down" | null>(
            null
        );
        const completedRef = useRef(false);
        const containerRef = useRef<HTMLDivElement | null>(null);

        // Reactions UI state for top and bottom
        const [topShowBar, setTopShowBar] = useState(false);
        const [bottomShowBar, setBottomShowBar] = useState(false);
        const [topPickerVisible, setTopPickerVisible] = useState(false);
        const [bottomPickerVisible, setBottomPickerVisible] = useState(false);
        const [floatingEmojis, setFloatingEmojis] = useState<
            { id: number; emoji: string; top: boolean }[]
        >([]);

        // Reset internal state when a new pair arrives
        useEffect(() => {
            setExitingDir(null);
            completedRef.current = false;
            setTopShowBar(false);
            setBottomShowBar(false);
            setTopPickerVisible(false);
            setBottomPickerVisible(false);
            setFloatingEmojis([]);
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

        const addFloatingEmoji = (emoji: string, isTop: boolean) => {
            const id = Date.now() + Math.random();
            setFloatingEmojis((prev) => [...prev, { id, emoji, top: isTop }]);
            setTimeout(() => {
                setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
            }, 2000);
        };

        const handleEmojiReact = async (emoji: string, isTop: boolean) => {
            addFloatingEmoji(emoji, isTop);
            const image = isTop ? topImage : bottomImage;
            await reactionService.submitReaction(image.imageId, emoji);
        };

        const suggestedEmojis = ["😀", "😂", "🍒"];
        const pickerEmojis = [
            "😀",
            "😂",
            "😍",
            "😎",
            "🤔",
            "😢",
            "😡",
            "🎉",
            "👍",
            "👎",
        ];

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
                onPointerCancel={() => {
                }}
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
                            : "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                    }
                >
                    {/* Top image with reactions */}
                    <div className="relative w-full overflow-hidden">
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

                        {/* Floating emojis overlay for top (origin near middle) */}
                        {floatingEmojis
                            .filter((f) => f.top)
                            .map(({ id, emoji }) => (
                                <span
                                    key={id}
                                    className="animate-float-down pointer-events-none absolute left-1/2 -translate-x-1/2 text-3xl"
                                    style={{ bottom: "10%" }}
                                >
                                    {emoji}
                                </span>
                            ))}

                        {/* React button for top moved to right, near middle boundary */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTopShowBar((prev) => !prev);
                                setTopPickerVisible(false);
                            }}
                            className="bg-opacity-60 hover:bg-opacity-80 absolute right-3 bottom-2 z-20 rounded-full bg-black px-3 py-2 text-sm text-white transition-all duration-300"
                        >
                            ❤️ React
                        </button>

                        {/* Emoji bar for top anchored at bottom (near middle boundary) */}
                        <div
                            className={`absolute bottom-0 left-0 z-10 w-full overflow-hidden rounded-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${topShowBar
                                ? "max-h-24 opacity-100"
                                : "max-h-0 opacity-0"
                                }`}
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                        >
                            <div className="flex items-center justify-center gap-4 px-4 py-3 text-2xl">
                                {suggestedEmojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmojiReact(emoji, true);
                                        }}
                                        className="transition-transform hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}

                                {/* Emoji picker toggle */}
                                <div className="relative flex items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTopPickerVisible(
                                                (prev) => !prev
                                            );
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-transform hover:scale-110 hover:bg-gray-100"
                                        aria-label="Toggle emoji picker"
                                    >
                                        {!topPickerVisible ? (
                                            <Plus className="h-5 w-5" />
                                        ) : (
                                            <Minus className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Emoji picker overlay for top */}
                        {topPickerVisible && (
                            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                                <div className="pointer-events-auto rounded-lg bg-black/40 p-4">
                                    <div className="grid grid-cols-5 gap-2 text-3xl">
                                        {pickerEmojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    handleEmojiReact(
                                                        emoji,
                                                        true
                                                    );
                                                    setTopPickerVisible(false);
                                                    setTopShowBar(false);
                                                }}
                                                className="transition-transform hover:scale-110"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px w-full bg-gray-200" />

                    {/* Bottom image with reactions */}
                    <div className="relative w-full overflow-hidden">
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

                        {/* Floating emojis overlay for bottom (origin near middle) */}
                        {floatingEmojis
                            .filter((f) => !f.top)
                            .map(({ id, emoji }) => (
                                <span
                                    key={id}
                                    className="animate-float-up pointer-events-none absolute left-1/2 -translate-x-1/2 text-3xl"
                                    style={{ top: "10%" }}
                                >
                                    {emoji}
                                </span>
                            ))}

                        {/* React button for bottom moved to right, near middle boundary */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setBottomShowBar((prev) => !prev);
                                setBottomPickerVisible(false);
                            }}
                            className="bg-opacity-60 hover:bg-opacity-80 absolute top-2 right-3 z-20 rounded-full bg-black px-3 py-2 text-sm text-white transition-all duration-300"
                        >
                            ❤️ React
                        </button>

                        {/* Emoji bar for bottom anchored at top (near middle boundary) */}
                        <div
                            className={`absolute top-0 left-0 z-10 w-full overflow-hidden rounded-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${bottomShowBar
                                ? "max-h-24 opacity-100"
                                : "max-h-0 opacity-0"
                                }`}
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                        >
                            <div className="flex items-center justify-center gap-4 px-4 py-3 text-2xl">
                                {suggestedEmojis.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEmojiReact(emoji, false);
                                        }}
                                        className="transition-transform hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}

                                {/* Emoji picker toggle */}
                                <div className="relative flex items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBottomPickerVisible(
                                                (prev) => !prev
                                            );
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-transform hover:scale-110 hover:bg-gray-100"
                                        aria-label="Toggle emoji picker"
                                    >
                                        {!bottomPickerVisible ? (
                                            <Plus className="h-5 w-5" />
                                        ) : (
                                            <Minus className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Emoji picker overlay for bottom */}
                        {bottomPickerVisible && (
                            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
                                <div className="pointer-events-auto rounded-lg bg-black/40 p-4">
                                    <div className="grid grid-cols-5 gap-2 text-3xl">
                                        {pickerEmojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    handleEmojiReact(
                                                        emoji,
                                                        false
                                                    );
                                                    setBottomPickerVisible(
                                                        false
                                                    );
                                                    setBottomShowBar(false);
                                                }}
                                                className="transition-transform hover:scale-110"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }
);
