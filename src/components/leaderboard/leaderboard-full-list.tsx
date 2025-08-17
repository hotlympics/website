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
            <div className="rounded bg-gray-50 p-8 text-center">
                <p className="text-gray-500">No entries found</p>
            </div>
        );
    }

    return (
        <div className="rounded bg-gray-50 p-4">
            <div className="space-y-2">
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
        </div>
    );
};

export default LeaderboardFullList;
