import EmptyState from "../components/admin/shared/empty-state.js";
import LoadingState from "../components/admin/shared/loading-state.js";
import LeaderboardDetailCard from "../components/leaderboard/leaderboard-detail-card.js";
import LeaderboardFullList from "../components/leaderboard/leaderboard-full-list.js";
import LeaderboardPodium from "../components/leaderboard/leaderboard-podium.js";
import LeaderboardSelector from "../components/leaderboard/leaderboard-selector.js";
import { useLeaderboard } from "../hooks/leaderboard/use-leaderboard.js";

const LeaderboardPage = () => {
    const {
        entries,
        loading,
        error,
        selectedEntry,
        viewMode,
        currentLeaderboard,
        selectEntry,
        clearSelection,
        switchLeaderboard,
    } = useLeaderboard();

    if (loading) {
        return <LoadingState message="Loading leaderboard..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    <EmptyState
                        title="Failed to load leaderboard"
                        description={error}
                        icon={
                            <svg
                                className="mx-auto mb-3 h-12 w-12 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        }
                    />
                </div>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    <EmptyState
                        title="No leaderboard data"
                        description="There are no entries for this leaderboard yet."
                        icon={
                            <svg
                                className="mx-auto mb-3 h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                            </svg>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-4 pt-8 pb-4">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-row items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Leaderboard
                        </h1>
                        <LeaderboardSelector
                            currentLeaderboard={currentLeaderboard}
                            onLeaderboardChange={switchLeaderboard}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Top Section - Podium or Detail Card */}
            <div className="h-80 flex-shrink-0 px-4 pb-4">
                <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
                    {viewMode === "podium" ? (
                        <LeaderboardPodium
                            entries={entries}
                            onEntryClick={selectEntry}
                        />
                    ) : (
                        selectedEntry && (
                            <LeaderboardDetailCard
                                entry={selectedEntry}
                                rank={
                                    entries.findIndex(
                                        (e) =>
                                            e.imageId === selectedEntry.imageId
                                    ) + 1
                                }
                                onClose={clearSelection}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Scrollable Cards Section */}
            <div className="h-[30rem] overflow-y-auto px-4 pt-4 pb-20">
                <div className="mx-auto max-w-6xl">
                    <LeaderboardFullList
                        entries={entries}
                        selectedEntry={selectedEntry}
                        onEntryClick={selectEntry}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
