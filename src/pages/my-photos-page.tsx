import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DeleteConfirmationModal from "../components/profile/delete-confirmation-modal";
import PhotoGallery from "../components/profile/photo-gallery";
import PoolSelection from "../components/profile/pool-selection";
import { useAuth } from "../hooks/auth/use-auth";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { usePoolManagement } from "../hooks/profile/use-pool-management";
import { useProfile } from "../hooks/profile/use-profile";

interface DeleteConfirmation {
    photoId: string;
    isInPool: boolean;
}

const MyPhotosPage = () => {
    const { loading: authLoading } = useAuth();
    const {
        uploadedPhotos,
        isDeleting,
        fetchUploadedPhotos,
        deletePhoto,
    } = usePhotoUpload();
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

    // Redirect to sign in if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/signin?redirect=/my-photos" replace />;
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
        <div className="min-h-screen">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">
                        My Photos
                    </h1>
                    <p className="text-gray-400">
                        Manage your uploaded photos and rating pool selections
                    </p>
                </div>

                {uploadedPhotos.length > 0 && (
                    <div className="mb-8">
                        <PoolSelection
                            poolSelections={poolSelections}
                            user={user}
                            isUpdating={isUpdatingPool}
                            onUpdatePool={handlePoolUpdate}
                        />
                    </div>
                )}

                <PhotoGallery
                    photos={uploadedPhotos}
                    poolSelections={poolSelections}
                    onPoolToggle={handlePoolToggle}
                    onDeletePhoto={handleDeletePhoto}
                    deletingPhoto={isDeleting}
                />

                {uploadedPhotos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg mb-2">No photos uploaded yet</p>
                            <p className="text-sm">Upload your first photo to get started!</p>
                        </div>
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

export default MyPhotosPage;