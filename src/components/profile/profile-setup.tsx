import { useState } from "react";

interface ProfileSetupData {
    gender: "unknown" | "male" | "female";
    dateOfBirth: string;
}

interface ProfileSetupProps {
    onSubmit: (data: ProfileSetupData) => Promise<void>;
    onLogout: () => void;
    isLoading: boolean;
    error: string | null;
}

const ProfileSetup = ({
    onSubmit,
    onLogout,
    isLoading,
    error,
}: ProfileSetupProps) => {
    const [profileForm, setProfileForm] = useState<ProfileSetupData>({
        gender: "unknown",
        dateOfBirth: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(profileForm);
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-md px-4 py-8">
                <h1 className="mb-8 text-center text-3xl font-bold text-gray-100">
                    Complete Your Profile
                </h1>

                <div className="rounded-lg bg-gray-800 p-8 shadow-md">
                    <p className="mb-6 text-center text-gray-400">
                        Please provide your gender and date of birth to
                        continue.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="gender"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={profileForm.gender}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        gender: e.target.value as
                                            | "male"
                                            | "female",
                                    })
                                }
                                className="block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none"
                                required
                            >
                                <option value="unknown" disabled>
                                    Select your gender
                                </option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="dateOfBirth"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={profileForm.dateOfBirth}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        dateOfBirth: e.target.value,
                                    })
                                }
                                max={new Date().toISOString().split("T")[0]}
                                className="block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-gray-100 placeholder-gray-400 shadow-sm focus:outline-none"
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-900/20 p-4">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    profileForm.gender === "unknown" ||
                                    !profileForm.dateOfBirth
                                }
                                className={`flex-1 rounded-md px-4 py-2 font-medium text-white ${
                                    isLoading ||
                                    profileForm.gender === "unknown" ||
                                    !profileForm.dateOfBirth
                                        ? "cursor-not-allowed bg-gray-600"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {isLoading ? "Updating..." : "Save Profile"}
                            </button>

                            <button
                                type="button"
                                onClick={onLogout}
                                className="rounded-md bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
