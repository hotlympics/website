import EmptyState from "../components/admin/shared/empty-state.js";
import LoadingState from "../components/admin/shared/loading-state.js";
import FullscreenImageModal from "../components/leaderboard/fullscreen-image-modal.js";
import LeaderboardFullList from "../components/leaderboard/leaderboard-full-list.js";
import LeaderboardHeader from "../components/leaderboard/leaderboard-header.js";
import { useLeaderboard } from "../hooks/leaderboard/use-leaderboard.js";

const LeaderboardPage = () => {
    const {
        entries,
        loading,
        error,
        selectedEntry,
        showingFullscreen,
        switchGender,
        getCurrentGender,
        openFullscreen,
        closeFullscreen,
    } = useLeaderboard();

    if (loading) {
        return <LoadingState message="Loading leaderboard..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen px-4 py-8">
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
            <div className="min-h-screen px-4 py-8">
                <div className="mx-auto max-w-6xl">
                    <EmptyState
                        title="No leaderboard data"
                        description="There are no entries for this leaderboard yet."
                        icon={
                            <svg
                                className="mx-auto mb-3 h-12 w-12 text-gray-300"
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
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <LeaderboardHeader
                    currentGender={getCurrentGender()}
                    onGenderChange={switchGender}
                    disabled={loading}
                />

                {/* Full List */}
                <LeaderboardFullList
                    entries={entries}
                    selectedEntry={selectedEntry}
                    onEntryClick={openFullscreen}
                />

                {/* Fullscreen Image Modal */}
                {selectedEntry && (
                    <FullscreenImageModal
                        entry={selectedEntry}
                        isOpen={showingFullscreen}
                        onClose={closeFullscreen}
                    />
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
