import { useState } from "react";
import SearchInput from "../../../components/admin/shared/search-input";
import Pagination from "../../../components/admin/shared/pagination";
import BattleTable from "../../../components/admin/management/battles/battle-table";
import { adminService, type AdminBattle } from "../../../services/admin/admin-service";
import { usePagination } from "../../../hooks/admin/use-pagination";

type SearchType = "email" | "imageId";

const BattlesTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<SearchType>("imageId");
    const [battles, setBattles] = useState<AdminBattle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedBattles, setExpandedBattles] = useState<Set<string>>(new Set());
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination with 10 items per page (50 results = 5 pages)
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedBattles,
    } = usePagination(battles, 10);

    const handleSearch = async () => {
        if (searchType !== "imageId") {
            setError("Only image ID search is currently supported");
            return;
        }

        if (!searchTerm.trim()) {
            setError("Please enter an image ID to search");
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const result = await adminService.searchBattles(searchTerm.trim(), 50);
            setBattles(result.battles);
            setCurrentPage(1); // Reset to first page when new search is performed
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to search battles");
            setBattles([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleBattleExpansion = (battleId: string) => {
        setExpandedBattles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(battleId)) {
                newSet.delete(battleId);
            } else {
                newSet.add(battleId);
            }
            return newSet;
        });
    };

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
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
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Search by:</span>
                            <div className="flex rounded-md border border-gray-300 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setSearchType("email")}
                                    disabled={true}
                                    className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${
                                        searchType === "email"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                    title="Email search coming soon"
                                >
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType("imageId")}
                                    className={`px-3 py-1 text-sm font-medium rounded-r-md border-l transition-colors ${
                                        searchType === "imageId"
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                    }`}
                                >
                                    Image ID
                                </button>
                            </div>
                        </div>
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder={`Search by ${searchType === "email" ? "email" : "image ID"}...`}
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

            {error && (
                <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            )}

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
                        expandedBattles={expandedBattles}
                        onToggleExpansion={toggleBattleExpansion}
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
    );
};

export default BattlesTab;
