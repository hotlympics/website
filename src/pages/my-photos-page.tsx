import { useAuth } from "../hooks/auth/use-auth.js";

const MyPhotosPage = () => {
    const { user, loading } = useAuth();

    // Loading state
    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Photos & Ratings
                    </h1>
                    <p className="mt-2 text-gray-600">
                        View all your uploaded photos and their performance
                    </p>
                </div>

                <div className="rounded-lg bg-white p-8 shadow-md text-center">
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Photo Analytics Coming Soon
                    </h2>
                    <p className="text-gray-500">
                        This page will display all your photos with detailed rating statistics, 
                        performance metrics, and analytics.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyPhotosPage;