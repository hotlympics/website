import { useEffect } from "react";
import { LeaderboardEntry } from "../../services/cache/leaderboard.js";

interface FullscreenImageModalProps {
    entry: LeaderboardEntry;
    isOpen: boolean;
    onClose: () => void;
}

const FullscreenImageModal = ({
    entry,
    isOpen,
    onClose,
}: FullscreenImageModalProps) => {
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={onClose}
        >
            {/* Close button in top-left corner */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/80 transition-all hover:bg-black/50 hover:text-white"
                aria-label="Close fullscreen image"
            >
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>

            {/* Fullscreen image */}
            <img
                src={entry.imageUrl}
                alt={`Leaderboard participant - Fullscreen view`}
                className="max-h-full max-w-full object-contain px-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-avatar.png";
                }}
            />
        </div>
    );
};

export default FullscreenImageModal;
