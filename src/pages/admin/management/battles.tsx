import { useState, useEffect, useCallback } from "react";
import SearchInput from "../../../components/admin/shared/search-input";
import Pagination from "../../../components/admin/shared/pagination";
import BattleTable from "../../../components/admin/management/battles/battle-table";
import { adminService, type AdminBattle } from "../../../services/admin/admin-service";
import { usePagination } from "../../../hooks/admin/use-pagination";

const BattlesTab = ({ initialSearchTerm, onNavigateToUsers }: { initialSearchTerm?: string; onNavigateToUsers?: (email: string, userId?: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [battles, setBattles] = useState<AdminBattle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchedImageUrl, setSearchedImageUrl] = useState<string>("");
    const [selectedBattle, setSelectedBattle] = useState<AdminBattle | null>(null);
    const [otherImageUrl, setOtherImageUrl] = useState<string>("");

    // Pagination with 10 items per page (50 results = 5 pages)
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedBattles,
    } = usePagination(battles, 10);

    const performSearch = useCallback(async (searchValue: string) => {
        if (!searchValue.trim()) {
            setError("Please enter an image ID to search");
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const result = await adminService.searchBattlesWithEmails(searchValue, 50);
            setBattles(result.battles);
            setCurrentPage(1); // Reset to first page when new search is performed
            
            // Fetch the image URL for the searched image
            try {
                const imageResult = await adminService.getImageUrl(searchValue);
                setSearchedImageUrl(imageResult.imageUrl);
            } catch (imageError) {
                console.error("Failed to fetch image URL:", imageError);
                setSearchedImageUrl(""); // Clear image URL on error
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to search battles");
            setBattles([]);
        } finally {
            setLoading(false);
        }
    }, [setCurrentPage]);

    // Handle initial search term from navigation
    useEffect(() => {
        if (initialSearchTerm && initialSearchTerm.trim()) {
            setSearchTerm(initialSearchTerm.trim());
            performSearch(initialSearchTerm.trim());
        }
    }, [initialSearchTerm, performSearch]);

    const handleSearch = async () => {
        await performSearch(searchTerm.trim());
    };

    const handleOtherImageClick = () => {
        if (selectedBattle) {
            // Determine which image is the "other" one
            const searchedImageId = searchTerm.trim();
            let otherImageId: string;
            
            if (selectedBattle.winnerImageId === searchedImageId) {
                // Searched image is the winner, the other is the loser
                otherImageId = selectedBattle.loserImageId;
            } else {
                // Searched image is the loser (or not involved), the other is the winner
                otherImageId = selectedBattle.winnerImageId;
            }
            
            // Perform new search with the other image ID
            setSearchTerm(otherImageId);
            performSearch(otherImageId);
            setSelectedBattle(null); // Clear selection
            setOtherImageUrl(""); // Clear the other image
        }
    };

    const handleBattleClick = async (battle: AdminBattle) => {
        setSelectedBattle(battle);
        setOtherImageUrl("");
        
        // Determine which image is different from the searched one
        const searchedImageId = searchTerm.trim();
        let otherImageId: string;
        
        if (battle.winnerImageId === searchedImageId) {
            // Searched image is the winner, show the loser
            otherImageId = battle.loserImageId;
        } else {
            // Searched image is the loser (or not involved), show the winner
            otherImageId = battle.winnerImageId;
        }
        
        try {
            const result = await adminService.getImageUrl(otherImageId);
            setOtherImageUrl(result.imageUrl);
        } catch (err) {
            console.error("Failed to fetch other image URL:", err);
            setOtherImageUrl("");
        }
    };

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
            {/* Header - Full Width */}
            <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            All Battles
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Search for battles by image ID
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search by image ID..."
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message - Full Width */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            )}

            {/* Main Content - Split Layout */}
            <div className="flex">
                {/* Left Side - Battle Table (70% width) */}
                <div style={{ width: "70%" }}>
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="text-lg text-gray-600">Searching battles...</div>
                        </div>
                    ) : hasSearched ? (
                        <>
                            <BattleTable
                                battles={paginatedBattles}
                                searchTerm={searchTerm}
                                searchedImageId={searchTerm}
                                selectedBattle={selectedBattle}
                                onBattleClick={handleBattleClick}
                                onNavigateToUsers={onNavigateToUsers}
                            />

                            {battles.length > 10 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={battles.length}
                                    itemsPerPage={10}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="mt-2 text-sm text-gray-500">Search to find battles</p>
                        </div>
                    )}
                </div>

                {/* Right Side - Search Image Display (30% width) */}
                <div style={{ width: "30%" }} className="bg-gray-50 border-l border-gray-200 p-6">
                    {hasSearched && searchTerm ? (
                        <div className="space-y-4">
                            {/* Main searched image */}
                            <div className="text-center">
                                {searchedImageUrl ? (
                                    <div className="aspect-square w-full overflow-hidden rounded-lg shadow-md">
                                        <img
                                            src={searchedImageUrl}
                                            alt={`Image ${searchTerm}`}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square w-full bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400">Image not found</span>
                                    </div>
                                )}
                            </div>

                            {/* Other battle image */}
                            {selectedBattle && (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <div 
                                            className="aspect-square w-full overflow-hidden rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-all duration-200"
                                            onClick={handleOtherImageClick}
                                        >
                                            {otherImageUrl ? (
                                                <img
                                                    src={otherImageUrl}
                                                    alt="Other battle image"
                                                    className="h-full w-full object-cover"
                                                    draggable={false}
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Loading...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-square w-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No search performed</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BattlesTab;