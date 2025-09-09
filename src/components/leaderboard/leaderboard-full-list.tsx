import { LeaderboardEntry } from "../../services/cache/leaderboard.js";
import LeaderboardEntryRow from "./leaderboard-entry-row.js";

interface LeaderboardFullListProps {
    entries: LeaderboardEntry[];
    selectedEntry: LeaderboardEntry | null;
    onEntryClick: (entry: LeaderboardEntry) => void;
}

const LeaderboardFullList = ({
    entries,
    selectedEntry,
    onEntryClick,
}: LeaderboardFullListProps) => {
    if (entries.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <p className="text-gray-300">No entries found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-6">
            {entries.map((entry, index) => {
                const rank = index + 1;
                const isSelected = selectedEntry?.imageId === entry.imageId;

                return (
                    <LeaderboardEntryRow
                        key={entry.imageId}
                        entry={entry}
                        rank={rank}
                        isSelected={isSelected}
                        onEntryClick={onEntryClick}
                    />
                );
            })}
        </div>
    );
};

export default LeaderboardFullList;
