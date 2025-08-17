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
                className={`flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all duration-200 focus:outline-none ${
                    disabled
                        ? "cursor-not-allowed bg-gray-50 text-gray-400"
                        : "bg-gradient-to-r from-emerald-50 to-white text-emerald-800 hover:from-emerald-100 hover:to-emerald-50 hover:shadow-lg active:scale-95"
                } `}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="truncate">{currentInfo.label}</span>
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
