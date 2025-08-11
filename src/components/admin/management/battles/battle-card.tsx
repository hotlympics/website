import { formatDate } from "../../../../utils/admin/formatters";
import type { AdminBattle } from "../../../../services/admin/admin-service";

interface BattleCardProps {
    battle: AdminBattle;
    searchedImageId: string;
    onBattleClick: (battle: AdminBattle) => void;
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const BattleCard = ({ battle, searchedImageId, onBattleClick }: BattleCardProps) => {
    const ratingChange = battle.winnerRatingAfter - battle.winnerRatingBefore;
    const loserRatingChange = battle.loserRatingAfter - battle.loserRatingBefore;

    const isWinner = battle.winnerImageId === searchedImageId;
    const isLoser = battle.loserImageId === searchedImageId;

    const getRowClasses = () => {
        return "transition-colors hover:bg-gray-50";
    };

    return (
        <tr 
            className={`${getRowClasses()} cursor-pointer`}
            onClick={() => onBattleClick(battle)}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatTime(battle.timestamp)}
                </div>
                <div className="text-sm text-gray-500">
                    {formatDate(battle.timestamp)}
                </div>
            </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`mb-1 rounded-md px-2 py-1 text-sm text-gray-900 ${
                        isWinner ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                        {battle.winnerEmail || battle.winnerUserId.slice(-8)}
                    </div>
                    <div className={`rounded-md px-2 py-1 text-sm text-gray-900 ${
                        isLoser ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                        {battle.loserEmail || battle.loserUserId.slice(-8)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="mb-1 text-sm text-gray-900">
                        {Math.round(battle.winnerRatingBefore)} → {Math.round(battle.winnerRatingAfter)}
                        <span className={`ml-2 ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({ratingChange >= 0 ? '+' : ''}{Math.round(ratingChange)})
                        </span>
                    </div>
                    <div className="text-sm text-gray-900">
                        {Math.round(battle.loserRatingBefore)} → {Math.round(battle.loserRatingAfter)}
                        <span className={`ml-2 ${loserRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({loserRatingChange >= 0 ? '+' : ''}{Math.round(loserRatingChange)})
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {battle.voterId ? (
                        <div className="text-sm text-gray-900">
                            {battle.voterEmail || `[User ${battle.voterId.slice(-8)}]`}
                        </div>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Anonymous
                        </span>
                    )}
                </td>
            </tr>
        );
    };

export default BattleCard;
