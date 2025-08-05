import type { 
    AdminImageData, 
    AdminUser, 
    PhotoModalData, 
    UserDetails 
} from "../types/admin";

export interface PhotoDeleteConfirmation {
    imageId: string;
    userId: string;
    isInPool: boolean;
}

// Photo modal utilities
export const createPhotoModalHandlers = (
    userDetails: Record<string, UserDetails>,
    setPhotoModal: (modal: PhotoModalData | null) => void
) => {
    const openPhotoModal = (imageData: AdminImageData) => {
        const userId = Object.keys(userDetails).find((uid) =>
            userDetails[uid].imageData.some(
                (img) => img.imageId === imageData.imageId
            )
        );

        if (!userId) return;

        const user = userDetails[userId]?.user;
        const isInPool =
            user?.poolImageIds.includes(imageData.imageId) || false;

        setPhotoModal({
            imageData,
            isInPool,
        });
    };

    return { openPhotoModal };
};

// Photo deletion utilities
export const createPhotoDeleteHandlers = (
    userDetails: Record<string, UserDetails>,
    setDeleteConfirmation: (confirmation: PhotoDeleteConfirmation | null) => void
) => {
    const handleDeletePhoto = (
        imageId: string,
        userId: string,
        event?: React.MouseEvent
    ) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const userDetail = userDetails[userId];
        const isInPool =
            userDetail?.user.poolImageIds.includes(imageId) || false;

        setDeleteConfirmation({
            imageId,
            userId,
            isInPool,
        });
    };

    return { handleDeletePhoto };
};

// State update utilities for photo operations
export const updateStateAfterPhotoDelete = (
    deletedImageId: string,
    affectedUserId: string,
    setUserDetails: React.Dispatch<React.SetStateAction<Record<string, UserDetails>>>,
    setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>,
    photoModal: PhotoModalData | null,
    setPhotoModal: (modal: PhotoModalData | null) => void
) => {
    // Update local state - remove photo from user details
    setUserDetails((prev) => {
        const updated = { ...prev };
        if (updated[affectedUserId]) {
            updated[affectedUserId] = {
                ...updated[affectedUserId],
                imageData: updated[affectedUserId].imageData.filter(
                    (img) => img.imageId !== deletedImageId
                ),
                user: {
                    ...updated[affectedUserId].user,
                    uploadedImageIds: updated[
                        affectedUserId
                    ].user.uploadedImageIds.filter(
                        (id) => id !== deletedImageId
                    ),
                    poolImageIds: updated[
                        affectedUserId
                    ].user.poolImageIds.filter(
                        (id) => id !== deletedImageId
                    ),
                },
            };
        }
        return updated;
    });

    // Update users list
    setUsers((prev) =>
        prev.map((user) =>
            user.id === affectedUserId
                ? {
                      ...user,
                      uploadedImageIds: user.uploadedImageIds.filter(
                          (id) => id !== deletedImageId
                      ),
                      poolImageIds: user.poolImageIds.filter(
                          (id) => id !== deletedImageId
                      ),
                  }
                : user
        )
    );

    // Close modal if it's open and showing the deleted photo
    if (photoModal?.imageData.imageId === deletedImageId) {
        setPhotoModal(null);
    }
};

export const updateStateAfterPhotoPoolToggle = (
    toggledImageId: string,
    affectedUserId: string,
    isInPool: boolean,
    setUserDetails: React.Dispatch<React.SetStateAction<Record<string, UserDetails>>>,
    setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>,
    users: AdminUser[],
    photoModal: PhotoModalData | null,
    setPhotoModal: (modal: PhotoModalData | null) => void
) => {
    // Update local state - photo modal
    if (
        photoModal &&
        photoModal.imageData.imageId === toggledImageId
    ) {
        setPhotoModal({
            ...photoModal,
            isInPool: isInPool,
        });
    }

    // Update local state - user details
    setUserDetails((prev) => {
        const updated = { ...prev };
        if (updated[affectedUserId]) {
            updated[affectedUserId] = {
                ...updated[affectedUserId],
                user: {
                    ...updated[affectedUserId].user,
                    poolImageIds: isInPool
                        ? [
                              ...updated[
                                  affectedUserId
                              ].user.poolImageIds.filter(
                                  (id) => id !== toggledImageId
                              ),
                              toggledImageId,
                          ]
                        : updated[
                              affectedUserId
                          ].user.poolImageIds.filter(
                              (id) => id !== toggledImageId
                          ),
                },
                imageData: updated[affectedUserId].imageData.map(
                    (img) =>
                        img.imageId === toggledImageId
                            ? { ...img, inPool: isInPool }
                            : img
                ),
            };
        }
        return updated;
    });

    // Update users array
    setUsers(
        users.map((user) =>
            user.id === affectedUserId
                ? {
                      ...user,
                      poolImageIds: isInPool
                          ? [
                                ...user.poolImageIds.filter(
                                    (id) => id !== toggledImageId
                                ),
                                toggledImageId,
                            ]
                          : user.poolImageIds.filter(
                                (id) => id !== toggledImageId
                            ),
                  }
                : user
        )
    );
};