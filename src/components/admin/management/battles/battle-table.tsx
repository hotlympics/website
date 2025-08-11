import type { AdminBattle } from "../../../../services/admin/admin-service";
import EmptyState from "../../shared/empty-state";
import BattleCard from "./battle-card";

interface BattleTableProps {
    battles: AdminBattle[];
    searchTerm: string;
    searchedImageId: string;
    selectedBattle: AdminBattle | null;
    onBattleClick: (battle: AdminBattle) => void;
}

const BattleTable = ({
    battles,
    searchTerm,
    searchedImageId,
    selectedBattle,
    onBattleClick,
}: BattleTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Rating
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
                                searchedImageId={searchedImageId}
                                isSelected={selectedBattle?.battleId === battle.battleId}
                                onBattleClick={onBattleClick}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>
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