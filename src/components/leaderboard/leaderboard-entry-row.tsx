import { LeaderboardEntry } from "../../services/cache/leaderboard.js";

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

    const getRankColors = () => {
        switch (rank) {
            case 1:
                return {
                    badge: "bg-[#FFD700]", // Gold - RGB(1.0, 0.84, 0)
                    border: "border-[#FFD700]/50", // Gold with 0.5 opacity
                };
            case 2:
                return {
                    badge: "bg-[#BFBFBF]", // Silver - RGB(0.75, 0.75, 0.75)
                    border: "border-[#BFBFBF]/50", // Silver with 0.5 opacity
                };
            case 3:
                return {
                    badge: "bg-[#CC8033]", // Bronze - RGB(0.8, 0.5, 0.2)
                    border: "border-[#CC8033]/50", // Bronze with 0.5 opacity
                };
            default:
                return {
                    badge: "bg-black",
                    border: "border-gray-600/30", // Gray with 0.3 opacity like iOS
                };
        }
    };

    const colors = getRankColors();

    return (
        <button
            onClick={() => onEntryClick(entry)}
            className={`group flex cursor-pointer flex-col items-center transition-all ${
                isSelected ? "opacity-80" : "hover:opacity-90"
            }`}
            type="button"
        >
            {/* Image with rank badge overlay */}
            <div className="relative">
                <img
                    src={entry.imageUrl}
                    alt={`Rank ${rank} participant`}
                    className={`h-[350px] w-[350px] rounded-lg border-2 object-cover transition-transform group-hover:scale-[1.02] ${colors.border}`}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-avatar.png";
                    }}
                />

                {/* Rank badge in top-left corner */}
                <div
                    className={`absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full ${colors.badge}`}
                >
                    <span
                        className={`font-bold text-white ${isTopThree ? "text-base" : "text-sm"}`}
                    >
                        {rank}
                    </span>
                </div>
            </div>

            {/* Rating below image - using medium weight for lighter appearance */}
            <div className="mt-3 text-[22px] font-medium text-white">
                {Math.round(entry.rating)} pts
            </div>
        </button>
    );
};

export default LeaderboardEntryRow;
