import { useEffect, useState } from "react";
import DeleteConfirmationModal from "../components/profile/delete-confirmation-modal";
import PhotoGallery from "../components/profile/photo-gallery";
import PoolSelection from "../components/profile/pool-selection";
import { useAuth } from "../hooks/auth/use-auth";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { usePoolManagement } from "../hooks/profile/use-pool-management";
import { useProfile } from "../hooks/profile/use-profile";
import DemoMyPhotosPage from "./demo-my-photos-page";

interface DeleteConfirmation {
    photoId: string;
    isInPool: boolean;
}

const MyPhotosPage = () => {
    const { user: authUser, loading: authLoading } = useAuth();

    // Show demo page immediately if not authenticated (before calling other hooks)
    if (!authLoading && !authUser) {
        return <DemoMyPhotosPage />;
    }

    // Loading state
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Only call these hooks if user is authenticated
    return <AuthenticatedMyPhotosPage />;
};

const AuthenticatedMyPhotosPage = () => {
    const { uploadedPhotos, isDeleting, fetchUploadedPhotos, deletePhoto } =
        usePhotoUpload();
    const { user, showSuccessMessage, refreshUserInfo } = useProfile();
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
                console.error("Pool update error:", errorMessage);
            }
        );
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4">
                {/* Header section */}
                <div className="flex-shrink-0 pt-8 pb-4">
                    <h1 className="mb-4 text-center text-xl font-bold text-gray-100">
                        My Photos
                    </h1>

                    {uploadedPhotos.length > 0 && (
                        <>
                            <PoolSelection
                                poolSelections={poolSelections}
                                user={user}
                                isUpdating={isUpdatingPool}
                                onUpdatePool={handlePoolUpdate}
                            />
                            <div className="mt-2 ml-4">
                                <span className="text-sm text-gray-400">
                                    {uploadedPhotos.length}/10 photos uploaded
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Scrollable content area */}
                <div className="overflow-y-auto">
                    {uploadedPhotos.length > 0 ? (
                        <PhotoGallery
                            photos={uploadedPhotos}
                            poolSelections={poolSelections}
                            onPoolToggle={handlePoolToggle}
                            onDeletePhoto={handleDeletePhoto}
                            deletingPhoto={isDeleting}
                        />
                    ) : (
                        <div className="py-12 text-center">
                            <svg
                                className="mx-auto mb-4 h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mb-2 text-lg text-gray-400">
                                No photos uploaded yet
                            </p>
                            <p className="text-sm text-gray-400">
                                Upload your first photo to get started!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDelete}
                title="Delete Photo"
                message="This will permanently delete the photo and all associated data. Are you sure?"
            />
        </div>
    );
};

export default MyPhotosPage;
