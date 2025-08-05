import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PerformanceMonitor from "../components/performance-monitor";
import { useAuth } from "../hooks/use-auth";
import { ImageData, imageService } from "../services/image-service";
import { ratingService } from "../services/rating-service";
import { userService } from "../services/user-service";

// ImageElement component inline
interface ImageElementProps {
    ImagePair: ImageData[];
    top: boolean;
    onClick: (value: ImageData) => void;
}

const ImageElement = ({ ImagePair, top, onClick }: ImageElementProps) => {
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

const RatePage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [imagePair, setImagePair] = useState<ImageData[] | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setImagesLoaded] = useState({
        image1: false,
        image2: false,
    });

    useEffect(() => {
        fetchImagePair();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchImagePair = async () => {
        setLoadingImages(true);
        setError(null);

        try {
            let gender: "male" | "female" = "female"; // Default to female for non-logged in users

            if (user) {
                // Fetch user details to get their gender
                const userDetails = await userService.getCurrentUser();

                if (userDetails && userDetails.gender !== "unknown") {
                    // Show opposite gender
                    gender = userDetails.gender === "male" ? "female" : "male";
                }
            }

            const pair = await imageService.fetchImagePair(gender);

            if (pair) {
                setImagesLoaded({ image1: false, image2: false });
                setImagePair(pair);
            } else {
                setError("No images available for rating at this time.");
            }
        } catch (err) {
            console.error("Error fetching images:", err);
            setError("Failed to load images. Please try again.");
        } finally {
            setLoadingImages(false);
        }
    };

    const handleImageClick = async (selectedImage: ImageData) => {
        if (!imagePair || imagePair.length !== 2) return;

        const winnerId = selectedImage.imageId;
        const loser = imagePair.find((img) => img.imageId !== winnerId);

        if (!loser) return;

        const loserId = loser.imageId;

        // Submit rating to server
        const success = await ratingService.submitRating(winnerId, loserId);

        if (success) {
            // Fetch new pair after successful rating
            fetchImagePair();
        } else {
            setError("Failed to submit rating. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-7xl">
                <div className="absolute top-4 right-4">
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
                <div className="mb-6 text-center">
                    <h1 className="mb-6 text-4xl font-bold text-gray-800">
                        Hotlympics Rating Arena
                    </h1>
                    <p className="text-xl text-gray-600">Pick who you prefer</p>
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
                        <button
                            onClick={fetchImagePair}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : imagePair && imagePair.length === 2 ? (
                    <div className="flex flex-col items-center justify-center gap-8">
                        <ImageElement
                            ImagePair={imagePair}
                            top={true}
                            onClick={handleImageClick}
                        />
                        <ImageElement
                            ImagePair={imagePair}
                            top={false}
                            onClick={handleImageClick}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-32">
                        <p className="text-xl text-gray-600">
                            No images available
                        </p>
                    </div>
                )}
            </div>
            <PerformanceMonitor />
        </div>
    );
};

export default RatePage;
