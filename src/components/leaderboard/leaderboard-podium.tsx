import { LeaderboardEntry } from "../../services/cache/leaderboard.js";
import CrownIcon from "./crown-icon.js";

interface LeaderboardPodiumProps {
    entries: LeaderboardEntry[];
    onEntryClick: (entry: LeaderboardEntry) => void;
}

const LeaderboardPodium = ({
    entries,
    onEntryClick,
}: LeaderboardPodiumProps) => {
    // Get top 3 entries
    const first = entries[0];
    const second = entries[1];
    const third = entries[2];

    if (!first) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-500">
                <p>No leaderboard data available</p>
            </div>
        );
    }

    const PodiumPosition = ({
        entry,
        rank,
        position,
    }: {
        entry: LeaderboardEntry;
        rank: number;
        position: "first" | "second" | "third";
    }) => {
        const isFirst = position === "first";
        const sizeClass = isFirst ? "h-36 w-36" : "h-28 w-28";
        const containerClass = isFirst
            ? "order-2"
            : position === "second"
              ? "order-1 self-end"
              : "order-3 self-end";
        // Add transform to push 2nd and 3rd place down and pull 1st place up
        const positionClass = isFirst
            ? "transform -translate-y-12"
            : "transform translate-y-8";

        return (
            <div
                className={`flex flex-1 flex-col items-center ${containerClass} ${positionClass}`}
            >
                {/* Crown for first place */}
                {isFirst && (
                    <div className="relative z-10 mb-3">
                        <CrownIcon
                            className="translate-y-5 transform text-emerald-500"
                            size={56}
                        />
                    </div>
                )}

                {/* Profile Image */}
                <div className="relative">
                    <button
                        onClick={() => onEntryClick(entry)}
                        className="group relative transition-transform hover:scale-105 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
                        type="button"
                    >
                        <div
                            className={`overflow-hidden rounded-full border-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 ${sizeClass} ${isFirst ? "border-emerald-400" : "border-emerald-300"} `}
                        >
                            <img
                                src={entry.imageUrl}
                                alt={`Rank ${rank} participant`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-avatar.png";
                                }}
                            />
                        </div>
                    </button>

                    {/* Rank Badge - Overlapping bottom of image */}
                    <div className="absolute -bottom-2 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white">
                        {rank}
                    </div>
                </div>

                {/* Score */}
                <p
                    className={`mt-3 text-center font-bold ${isFirst ? "rounded-full bg-emerald-50 px-3 py-1 text-lg text-emerald-700 shadow-sm" : "text-base text-emerald-600"}`}
                >
                    {Math.round(entry.rating)} pts
                </p>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-md">
            <div className="flex items-end justify-center gap-1">
                {/* Second Place */}
                {second && (
                    <PodiumPosition entry={second} rank={2} position="second" />
                )}

                {/* First Place */}
                <PodiumPosition entry={first} rank={1} position="first" />

                {/* Third Place */}
                {third && (
                    <PodiumPosition entry={third} rank={3} position="third" />
                )}
            </div>
        </div>
    );
};

export default LeaderboardPodium;
