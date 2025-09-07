import { LeaderboardEntry } from "../../services/cache/leaderboard.js";

interface LeaderboardDetailCardProps {
    entry: LeaderboardEntry;
    rank: number;
    onClose: () => void;
}

const LeaderboardDetailCard = ({
    entry,
    rank,
    onClose,
}: LeaderboardDetailCardProps) => {
    return (
        <div className="mx-auto h-80 w-80 overflow-hidden rounded-lg shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10 bg-gray-800">
            <img
                src={entry.imageUrl}
                alt={`Rank ${rank} participant`}
                className="h-full w-full cursor-pointer object-cover"
                onClick={onClose}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-avatar.png";
                }}
            />
        </div>
    );
};

export default LeaderboardDetailCard;
