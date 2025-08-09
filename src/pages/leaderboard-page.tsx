const LeaderboardPage = () => {
    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Leaderboard
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Top-rated photos and participants
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Photos Card */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                <svg
                                    className="h-5 w-5 text-yellow-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-700">
                                Top Rated Photos
                            </h2>
                        </div>
                        <p className="text-gray-500 text-center py-8">
                            Photo rankings coming soon...
                        </p>
                    </div>

                    {/* Top Contributors Card */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <svg
                                    className="h-5 w-5 text-blue-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-700">
                                Top Contributors
                            </h2>
                        </div>
                        <p className="text-gray-500 text-center py-8">
                            User rankings coming soon...
                        </p>
                    </div>
                </div>

                <div className="mt-8 rounded-lg bg-white p-8 shadow-md text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Leaderboard Analytics Coming Soon
                    </h2>
                    <p className="text-gray-500">
                        This page will display comprehensive rankings, statistics, and 
                        performance metrics for photos and users.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;