import type { AdminBattle } from "../../../../services/admin/admin-service";
import EmptyState from "../../shared/empty-state";
import BattleCard from "./battle-card";

interface BattleTableProps {
    battles: AdminBattle[];
    searchTerm: string;
    searchedImageId: string;
    expandedBattles: Set<string>;
    onToggleExpansion: (battleId: string) => void;
}

const BattleTable = ({
    battles,
    searchTerm,
    searchedImageId,
    expandedBattles,
    onToggleExpansion,
}: BattleTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Battle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Winner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Loser
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Winner Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Loser Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Voter
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {battles.length > 0 ? (
                        battles.map((battle) => (
                            <BattleCard
                                key={battle.battleId}
                                battle={battle}
                                isExpanded={expandedBattles.has(battle.battleId)}
                                searchedImageId={searchedImageId}
                                onToggleExpansion={onToggleExpansion}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7}>
                                <EmptyState
                                    title="No battles found"
                                    description={
                                        searchTerm
                                            ? `No battles found for image ID "${searchTerm}"`
                                            : "Search for an image ID to see battles"
                                    }
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BattleTable;