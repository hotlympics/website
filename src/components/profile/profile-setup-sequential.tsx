import { useState } from "react";
import { TermsOfService } from "./terms-of-service";

interface ProfileSetupData {
    gender: "unknown" | "male" | "female";
    dateOfBirth: string;
}

interface ProfileSetupSequentialProps {
    needsGenderAndDob: boolean;
    needsTosAcceptance: boolean;
    onSubmitProfile: (data: ProfileSetupData) => Promise<void>;
    onAcceptTos: () => Promise<boolean>;
    onLogout: () => void;
    isLoading: boolean;
    error: string | null;
    initialGender?: "unknown" | "male" | "female";
    initialDateOfBirth?: string | null;
}

const ProfileSetupSequential = ({
    needsGenderAndDob,
    needsTosAcceptance,
    onSubmitProfile,
    onAcceptTos,
    onLogout,
    isLoading,
    error,
    initialGender = "unknown",
    initialDateOfBirth = "",
}: ProfileSetupSequentialProps) => {
    const [profileForm, setProfileForm] = useState<ProfileSetupData>({
        gender: initialGender,
        dateOfBirth: initialDateOfBirth || "",
    });
    const [isProcessingTos, setIsProcessingTos] = useState(false);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmitProfile(profileForm);
    };

    const handleAcceptTos = async () => {
        setIsProcessingTos(true);
        const success = await onAcceptTos();
        setIsProcessingTos(false);
        if (!success) {
            // Error is handled by the parent component
        }
    };

    const handleDeclineTos = () => {
        // User declined TOS, log them out
        onLogout();
    };

    // Show gender/DOB form if needed
    if (needsGenderAndDob) {
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

                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-6"
                        >
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
                                    <p className="text-sm text-red-300">
                                        {error}
                                    </p>
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
                                    {isLoading ? "Updating..." : "Continue"}
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
    }

    // Show TOS acceptance if needed
    if (needsTosAcceptance) {
        return (
            <div className="min-h-screen">
                <div className="mx-auto max-w-2xl px-4 py-8">
                    <div className="rounded-lg bg-gray-800 p-8 shadow-md">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-900/20 p-4">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {isProcessingTos ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-400">Processing...</p>
                            </div>
                        ) : (
                            <TermsOfService
                                onAccept={handleAcceptTos}
                                onDecline={handleDeclineTos}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // This shouldn't happen, but just in case
    return null;
};

export default ProfileSetupSequential;
