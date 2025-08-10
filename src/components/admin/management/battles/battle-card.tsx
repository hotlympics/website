import { formatDate } from "../../../../utils/admin/formatters";
import type { AdminBattle } from "../../../../services/admin/admin-service";

interface BattleCardProps {
    battle: AdminBattle;
    isExpanded: boolean;
    searchedImageId: string;
    onToggleExpansion: (battleId: string) => void;
}

const BattleCard = ({ battle, isExpanded, searchedImageId, onToggleExpansion }: BattleCardProps) => {
    const ratingChange = battle.winnerRatingAfter - battle.winnerRatingBefore;
    const loserRatingChange = battle.loserRatingAfter - battle.loserRatingBefore;
    
    const isWinner = battle.winnerImageId === searchedImageId;
    const isLoser = battle.loserImageId === searchedImageId;
    
    const getRowClasses = () => {
        let baseClasses = "transition-colors";
        if (isWinner) {
            return `${baseClasses} bg-green-50 hover:bg-green-100`;
        } else if (isLoser) {
            return `${baseClasses} bg-red-50 hover:bg-red-100`;
        }
        return `${baseClasses} hover:bg-gray-50`;
    };

    return (
        <>
            <tr className={getRowClasses()}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        onClick={() => onToggleExpansion(battle.battleId)}
                        className="rounded-md p-2 text-gray-400 transition-transform duration-200 hover:bg-white hover:bg-opacity-50 hover:text-gray-600"
                    >
                        <svg
                            className={`h-5 w-5 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {battle.battleId.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                        {formatDate(battle.timestamp)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {battle.winnerImageId.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                        Winner • {battle.winnerUserId.slice(-8)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {battle.loserImageId.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-500">
                        Loser • {battle.loserUserId.slice(-8)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {Math.round(battle.winnerRatingBefore)} → {Math.round(battle.winnerRatingAfter)}
                    </div>
                    <div className={`text-sm ${ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ratingChange >= 0 ? '+' : ''}{Math.round(ratingChange)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                        {Math.round(battle.loserRatingBefore)} → {Math.round(battle.loserRatingAfter)}
                    </div>
                    <div className={`text-sm ${loserRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {loserRatingChange >= 0 ? '+' : ''}{Math.round(loserRatingChange)}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {battle.voterId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Auth
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Anon
                        </span>
                    )}
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={7} className={`px-6 py-4 ${isWinner ? 'bg-green-50' : isLoser ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className="text-sm text-gray-500">
                            Expanded battle details will go here...
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default BattleCard;