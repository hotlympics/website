import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    LEADERBOARD_OPTIONS,
    LeaderboardDisplayInfo,
    LeaderboardType,
} from "../../hooks/leaderboard/use-leaderboard.js";

interface LeaderboardSelectorProps {
    currentLeaderboard: LeaderboardType;
    onLeaderboardChange: (type: LeaderboardType) => void;
    disabled?: boolean;
}

const LeaderboardSelector = ({
    currentLeaderboard,
    onLeaderboardChange,
    disabled = false,
}: LeaderboardSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentInfo =
        LEADERBOARD_OPTIONS.find(
            (option) => option.key === currentLeaderboard
        ) || LEADERBOARD_OPTIONS[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const handleOptionClick = (option: LeaderboardDisplayInfo) => {
        onLeaderboardChange(option.key);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                    disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                } `}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="truncate">{currentInfo.label}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-48">
                    <div className="py-1">
                        {LEADERBOARD_OPTIONS.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => handleOptionClick(option)}
                                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                                    option.key === currentLeaderboard
                                        ? "bg-emerald-50 font-medium text-emerald-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                } `}
                                type="button"
                            >
                                <div>
                                    <div className="font-medium">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {option.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardSelector;
