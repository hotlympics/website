import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ImageData } from "../../services/core/image-queue-service";

interface ImageElementProps {
    ImagePair: ImageData[];
    top: boolean;
    onClick: (value: ImageData) => void;
}

export const ImageElement = ({
    ImagePair,
    top,
    onClick,
}: ImageElementProps) => {
    const ImageData = top ? ImagePair[0] : ImagePair[1];
    const [showInfo, setShowInfo] = useState(false);
    const [floatingEmojis, setFloatingEmojis] = useState<
        { id: number; emoji: string }[]
    >([]);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

    const suggestedEmojis = ["😀", "😂", "🍒"];

    const handleEmojiClick = (emoji: string) => {
        const id = Date.now() + Math.random();
        setFloatingEmojis((prev) => [...prev, { id, emoji }]);
        setTimeout(() => {
            setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
        }, 2000);
    };

    const barPosition = top ? "bottom-0" : "top-0";
    const buttonPosition = top ? "bottom-2" : "top-2";

    return (
        <div className="relative w-full max-w-md cursor-pointer overflow-visible rounded-lg">
            {/* Wrapper for image with clipping and rounded corners */}
            <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                    src={ImageData.imageUrl}
                    alt="Face"
                    className="h-96 w-full object-cover transition-transform hover:scale-105"
                    onClick={() => onClick(ImageData)}
                />
            </div>

            {/* Floating/Falling Emojis */}
            {floatingEmojis.map(({ id, emoji }) => (
                <span
                    key={id}
                    className={`pointer-events-none absolute text-3xl animate-${
                        top ? "float-down" : "float-up"
                    }`}
                    style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: top ? "80%" : "10%",
                    }}
                >
                    {emoji}
                </span>
            ))}

            {/* Toggle button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo((prev) => !prev);
                }}
                className={`absolute ${buttonPosition} bg-opacity-60 hover:bg-opacity-80 left-3 z-20 rounded-full bg-black px-3 py-2 text-sm text-white transition-all duration-300`}
            >
                ❤️ React
            </button>

            {/* Animated emoji bar */}
            <div
                className={`absolute ${barPosition} left-0 z-10 w-full overflow-hidden rounded-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${
                    showInfo ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
                <div className="flex justify-center gap-4 px-4 py-3 text-2xl">
                    {suggestedEmojis.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEmojiClick(emoji);
                            }}
                            className="transition-transform hover:scale-125"
                        >
                            {emoji}
                        </button>
                    ))}

                    {/* Emoji picker toggle + placeholder */}
                    <div className="relative flex items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEmojiPickerVisible((prev) => !prev);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-transform hover:scale-110 hover:bg-gray-100"
                            aria-label="Toggle emoji picker"
                        >
                            {!emojiPickerVisible ? (
                                <Plus className="h-5 w-5" />
                            ) : (
                                <Minus className="h-5 w-5" />
                            )}
                        </button>

                        {emojiPickerVisible && <></>}
                    </div>
                </div>
            </div>
        </div>
    );
};
