import { useCallback, useState } from "react";
import { adminService } from "../../../../services/admin-service";

export const usePhotoActions = () => {
    const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
    const [togglingPool, setTogglingPool] = useState<string | null>(null);

    const deletePhoto = useCallback(
        async (
            imageId: string,
            userId: string,
            onSuccess: (imageId: string, userId: string) => void
        ) => {
            try {
                setDeletingPhoto(imageId);
                await adminService.deletePhoto(imageId);
                onSuccess(imageId, userId);
            } catch (err) {
                console.error("Error deleting photo:", err);
                alert("Failed to delete photo. Please try again.");
            } finally {
                setDeletingPhoto(null);
            }
        },
        []
    );

    const togglePhotoPool = useCallback(
        async (
            imageId: string,
            userId: string,
            currentlyInPool: boolean,
            onSuccess: (
                imageId: string,
                userId: string,
                isInPool: boolean
            ) => void
        ) => {
            try {
                setTogglingPool(imageId);
                const result = await adminService.togglePhotoPool(
                    imageId,
                    userId,
                    !currentlyInPool
                );
                onSuccess(imageId, userId, result.isInPool);
            } catch (err) {
                console.error("Failed to toggle photo pool status:", err);
                alert(
                    `Failed to ${currentlyInPool ? "remove from" : "add to"} pool: ${err instanceof Error ? err.message : "Unknown error"}`
                );
            } finally {
                setTogglingPool(null);
            }
        },
        []
    );

    return {
        deletingPhoto,
        togglingPool,
        deletePhoto,
        togglePhotoPool,
    };
};
