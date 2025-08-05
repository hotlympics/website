import { useEffect, useState } from "react";
import DeleteConfirmationModal from "../components/profile/delete-confirmation-modal";
import PhotoGallery from "../components/profile/photo-gallery";
import PhotoUpload from "../components/profile/photo-upload";
import PoolSelection from "../components/profile/pool-selection";
import ProfileSetup from "../components/profile/profile-setup";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { usePoolManagement } from "../hooks/profile/use-pool-management";
import { useProfile } from "../hooks/profile/use-profile";

interface DeleteConfirmation {
    photoId: string;
    isInPool: boolean;
}

const ProfilePage = () => {
    const {
        user,
        authLoading,
        isUpdatingProfile,
        error,
        successMessage,
        updateProfile,
        logout,
        navigateToHome,
        showSuccessMessage,
        isProfileComplete,
        refreshUserInfo,
    } = useProfile();

    const {
        uploadedPhotos,
        isUploading,
        uploadStatus,
        uploadProgress,
        isDeleting,
        fetchUploadedPhotos,
        uploadPhoto,
        deletePhoto,
    } = usePhotoUpload();

    const {
        poolSelections,
        isUpdatingPool,
        togglePoolSelection,
        removeFromPool,
        updatePoolOnServer,
    } = usePoolManagement(user);

    const [deleteConfirmation, setDeleteConfirmation] =
        useState<DeleteConfirmation | null>(null);

    useEffect(() => {
        if (user) {
            fetchUploadedPhotos();
        }
    }, [user, fetchUploadedPhotos]);

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await uploadPhoto(
            file,
            (message) => showSuccessMessage(message),
            (errorMessage) => {
                // Handle upload error
                console.error("Upload error:", errorMessage);
            }
        );

        event.target.value = "";
    };

    const handleDeletePhoto = (photoId: string) => {
        const isInPool = poolSelections.has(photoId);
        setDeleteConfirmation({ photoId, isInPool });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { photoId } = deleteConfirmation;
        setDeleteConfirmation(null);

        removeFromPool(photoId);
        await deletePhoto(photoId);
    };

    const handlePoolToggle = (photoId: string) => {
        togglePoolSelection(photoId, (error) => {
            // Handle error - should show temporary error message
            console.error(error);
        });
    };

    const handlePoolUpdate = async () => {
        await updatePoolOnServer(
            () => {
                refreshUserInfo();
                showSuccessMessage("Pool selections updated successfully!");
            },
            (errorMessage) => {
                // Handle error
                console.error("Pool update error:", errorMessage);
            }
        );
    };

    // Loading state
    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Profile setup screen
    if (!isProfileComplete) {
        return (
            <ProfileSetup
                onSubmit={updateProfile}
                onLogout={logout}
                isLoading={isUpdatingProfile}
                error={error}
            />
        );
    }

    // Main profile page
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <button
                    onClick={navigateToHome}
                    className="mb-4 text-gray-600 hover:text-gray-800"
                >
                    ← Back to rating arena
                </button>

                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Account
                    </h1>
                    <button
                        onClick={logout}
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Profile Info Card */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Profile Information
                        </h2>
                        <p className="text-gray-600">Email: {user.email}</p>
                    </div>

                    {/* Upload Photo Card */}
                    <PhotoUpload
                        onFileSelect={handleFileSelect}
                        isUploading={isUploading}
                        uploadStatus={uploadStatus}
                        uploadProgress={uploadProgress}
                        uploadedPhotosCount={uploadedPhotos.length}
                    />
                </div>

                <div className="mt-8">
                    {uploadedPhotos.length > 0 && (
                        <PoolSelection
                            poolSelections={poolSelections}
                            user={user}
                            isUpdating={isUpdatingPool}
                            onUpdatePool={handlePoolUpdate}
                        />
                    )}

                    <PhotoGallery
                        photos={uploadedPhotos}
                        poolSelections={poolSelections}
                        onPoolToggle={handlePoolToggle}
                        onDeletePhoto={handleDeletePhoto}
                        deletingPhoto={isDeleting}
                    />
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                            {successMessage}
                        </p>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={
                    deleteConfirmation?.isInPool
                        ? "This image is currently in the rating pool. Deleting it will remove it from the pool and delete all associated data."
                        : "Deleting this image will permanently remove it and all associated data."
                }
                warningMessage="Are you sure you want to proceed?"
            />
        </div>
    );
};

export default ProfilePage;
