import { LeaderboardEntry } from "../../services/cache/leaderboard.js";
import CrownIcon from "./crown-icon.js";

interface LeaderboardEntryRowProps {
    entry: LeaderboardEntry;
    rank: number;
    isSelected: boolean;
    onEntryClick: (entry: LeaderboardEntry) => void;
}

const LeaderboardEntryRow = ({
    entry,
    rank,
    isSelected,
    onEntryClick,
}: LeaderboardEntryRowProps) => {
    const isTopThree = rank <= 3;

    return (
        <button
            onClick={() => onEntryClick(entry)}
            className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left shadow-sm transition-all ${
                isSelected
                    ? "bg-emerald-900/20 shadow-md ring-2 ring-white/10"
                    : "bg-gray-800 hover:bg-gray-700 hover:shadow-md"
            } `}
            type="button"
        >
            {/* Rank Number */}
            <div className="flex min-w-[2rem] items-center justify-center">
                {isTopThree ? (
                    <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-emerald-300">
                            {rank}
                        </span>
                        {rank === 1 && (
                            <CrownIcon className="text-emerald-300" size={16} />
                        )}
                    </div>
                ) : (
                    <span className="text-lg font-semibold text-gray-400">
                        {rank}
                    </span>
                )}
            </div>

            {/* Profile Picture */}
            <div
                className={`overflow-hidden rounded-full border-2 transition-transform group-hover:scale-105 ${
                    isTopThree
                        ? "h-14 w-14 border-emerald-300"
                        : "h-12 w-12 border-gray-700"
                } `}
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

            {/* Spacer to push score to right */}
            <div className="flex-1" />

            {/* Score */}
            <div className="text-right">
                <div
                    className={`font-semibold ${
                        isTopThree
                            ? "text-lg text-emerald-300"
                            : "text-gray-300"
                    } `}
                >
                    {Math.round(entry.rating)} pts
                </div>
                {entry.battles > 0 && (
                    <div className="text-xs text-gray-400">
                        {entry.wins}W-{entry.losses}L
                        {entry.draws > 0 && `-${entry.draws}D`}
                    </div>
                )}
            </div>
        </button>
    );
};

export default LeaderboardEntryRow;
