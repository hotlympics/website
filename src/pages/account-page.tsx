import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            navigate("/signin?redirect=/account");
            return;
        }

        const userInfo = localStorage.getItem("user_info");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
        navigate("/signin");
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-gray-600 hover:text-gray-800"
                >
                    ← Back to rating arena
                </button>
                
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Account
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">
                        Profile Information
                    </h2>
                    <p className="text-gray-600">Email: {user.email}</p>
                </div>

                <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">
                        Upload Your Photos
                    </h2>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <svg
                            className="mx-auto mb-4 h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="mb-2 text-gray-600">
                            Click to upload your photos
                        </p>
                        <p className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="photo-upload"
                        />
                        <label
                            htmlFor="photo-upload"
                            className="mt-4 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Choose File
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
