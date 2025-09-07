import { useEffect, useRef, useState } from "react";
import { GenderType } from "../../hooks/leaderboard/use-leaderboard.js";

interface LeaderboardHeaderProps {
    currentGender: GenderType;
    onGenderChange: (gender: GenderType) => void;
    disabled?: boolean;
}

const GENDER_OPTIONS = [
    { value: "female" as GenderType, label: "Women" },
    { value: "male" as GenderType, label: "Men" },
];

const LeaderboardHeader = ({
    currentGender,
    onGenderChange,
    disabled = false,
}: LeaderboardHeaderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentOption =
        GENDER_OPTIONS.find((option) => option.value === currentGender) ||
        GENDER_OPTIONS[0];

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

    const handleOptionClick = (option: (typeof GENDER_OPTIONS)[0]) => {
        onGenderChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className="mb-8 flex items-center justify-between">
            <div className="flex w-full justify-center">
                <div className="flex w-[350px] items-center justify-between">
                    <h1 className="text-3xl font-semibold text-white">
                        Leaderboard
                    </h1>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                            disabled={disabled}
                            className={`flex appearance-none items-center gap-1 rounded-lg border border-gray-600 bg-gray-900 px-2 py-1 text-sm font-medium text-white focus:outline-none ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-800"} `}
                            type="button"
                            aria-expanded={isOpen}
                            aria-haspopup="true"
                        >
                            <span>{currentOption.label}</span>
                            <svg
                                className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-0 z-50 mt-1 min-w-max rounded-lg border border-gray-600 bg-gray-900 shadow-lg">
                                <div className="p-1">
                                    {GENDER_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() =>
                                                handleOptionClick(option)
                                            }
                                            className={`block w-full rounded-md px-3 py-1 text-left text-sm transition-colors ${
                                                option.value === currentGender
                                                    ? "bg-gray-700 font-medium text-white"
                                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                            }`}
                                            type="button"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardHeader;
