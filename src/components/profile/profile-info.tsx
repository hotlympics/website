interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    poolImageIds?: string[];
}

interface ProfileInfoProps {
    user: UserInfo;
    onLogout: () => void;
    onNavigateBack: () => void;
}

const ProfileInfo = ({ user, onLogout, onNavigateBack }: ProfileInfoProps) => {
    return (
        <div className="mb-8">
            <button
                onClick={onNavigateBack}
                className="mb-4 text-gray-400 hover:text-gray-100"
            >
                ← Back to rating arena
            </button>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-100">My Account</h1>
                <button
                    onClick={onLogout}
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    Logout
                </button>
            </div>

            <div className="mt-6 rounded-lg bg-gray-800 p-6 shadow-md">
                <h2 className="mb-4 text-xl font-semibold text-gray-300">
                    Profile Information
                </h2>
                <p className="text-gray-400">Email: {user.email}</p>
            </div>
        </div>
    );
};

export default ProfileInfo;
