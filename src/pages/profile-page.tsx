import { useEffect } from "react";
import ProfileSetupSequential from "../components/profile/profile-setup-sequential";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { usePoolManagement } from "../hooks/profile/use-pool-management";
import { useProfile } from "../hooks/profile/use-profile";

const ProfilePage = () => {
    const {
        user,
        authLoading,
        isUpdatingProfile,
        error,
        successMessage,
        updateProfile,
        acceptTos,
        logout,
        isProfileComplete,
        needsGenderAndDob,
        needsTosAcceptance,
    } = useProfile();

    const {
        uploadedPhotos,
        fetchUploadedPhotos,
    } = usePhotoUpload();

    const {
        poolSelections,
    } = usePoolManagement(user);

    useEffect(() => {
        if (user) {
            fetchUploadedPhotos();
        }
    }, [user, fetchUploadedPhotos]);

    // Loading state
    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Profile setup screen (gender/DOB and/or TOS)
    if (!isProfileComplete) {
        return (
            <ProfileSetupSequential
                needsGenderAndDob={needsGenderAndDob}
                needsTosAcceptance={needsTosAcceptance}
                onSubmitProfile={updateProfile}
                onAcceptTos={acceptTos}
                onLogout={logout}
                isLoading={isUpdatingProfile}
                error={error}
                initialGender={user?.gender}
                initialDateOfBirth={user?.dateOfBirth ?? undefined}
            />
        );
    }

    // Main profile page
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 mx-auto max-w-lg px-4 py-8">
                {/* Profile Information */}
                <div className="mb-8 space-y-4">
                    <div className="space-y-3 text-gray-400">
                        <div className="text-center mb-6">
                            <span className="text-lg text-gray-100">{user.email}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span>Photos uploaded:</span>
                            <span className="text-gray-100 ml-36">{uploadedPhotos.length}/10</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span>Photos in pool:</span>
                            <span className="text-gray-100 ml-36">{poolSelections.size}/2</span>
                        </div>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-900/20 p-4">
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 rounded-md bg-green-900/20 p-4">
                        <p className="text-sm text-green-300">
                            {successMessage}
                        </p>
                    </div>
                )}
            </div>

            {/* Sign Out Button - positioned at bottom above menu bar */}
            <div className="px-4 pb-32 flex justify-center">
                <button
                    onClick={logout}
                    className="w-3/4 py-4 bg-orange-950/50 text-red-500 font-medium rounded-lg hover:bg-orange-950/60 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
