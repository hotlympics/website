import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import LoadingState from "../components/ui/LoadingState";
import Pagination from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";
import { useSearch } from "../hooks/useSearch";
import type {
    AdminImageData,
    AdminUser,
    CreateUserData,
    PhotoModalData,
} from "../types/admin";
import DeletePhotoModal from "./components/shared/DeletePhotoModal";
import PhotoModal from "./components/shared/PhotoModal";
import CreateUserModal from "./components/users/CreateUserModal";
import DeleteUserModal from "./components/users/DeleteUserModal";
import UserTable from "./components/users/UserTable";
import { usePhotoActions } from "./hooks/users/usePhotoActions";
import { useUserActions } from "./hooks/users/useUserActions";
import { useUserDetails } from "./hooks/users/useUserDetails";
import { useUsers } from "./hooks/users/useUsers";

const ManagementPage = () => {
    const { users, setUsers, stats, loading, error, loadData, refreshStats } =
        useUsers();
    const {
        userDetails,
        setUserDetails,
        loadingDetails,
        expandedUsers,
        toggleUserExpansion,
        removeUserDetails,
    } = useUserDetails();
    const { deleteLoading, createUserLoading, deleteUser, createUser } =
        useUserActions();
    const { deletingPhoto, togglingPool, deletePhoto, togglePhotoPool } =
        usePhotoActions();

    // Local state for modals and confirmations
    const [photoModal, setPhotoModal] = useState<PhotoModalData | null>(null);
    const [createUserModal, setCreateUserModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        imageId: string;
        userId: string;
        isInPool: boolean;
    } | null>(null);
    const [userDeleteConfirmation, setUserDeleteConfirmation] = useState<{
        userId: string;
        userEmail: string;
        step: "confirm" | "final";
    } | null>(null);

    // Search functionality
    const {
        searchTerm,
        setSearchTerm,
        filteredItems: filteredUsers,
    } = useSearch(users, (user: AdminUser, term: string) =>
        user.email.toLowerCase().includes(term)
    );

    // Pagination
    const {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems: paginatedUsers,
    } = usePagination(filteredUsers, 10);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, setCurrentPage]);

    const handleDeleteUser = (userId: string, userEmail: string) => {
        setUserDeleteConfirmation({
            userId,
            userEmail,
            step: "confirm",
        });
    };

    const proceedToFinalConfirmation = () => {
        if (!userDeleteConfirmation) return;
        setUserDeleteConfirmation({
            ...userDeleteConfirmation,
            step: "final",
        });
    };

    const backToConfirmation = () => {
        if (!userDeleteConfirmation) return;
        setUserDeleteConfirmation({
            ...userDeleteConfirmation,
            step: "confirm",
        });
    };

    const confirmDeleteUser = async () => {
        if (!userDeleteConfirmation) return;

        const { userId } = userDeleteConfirmation;

        await deleteUser(userId, (deletedUserId) => {
            // Remove user from local state
            setUsers(users.filter((user) => user.id !== deletedUserId));
            removeUserDetails(deletedUserId);

            // Refresh stats and close modal
            refreshStats();
            setUserDeleteConfirmation(null);
        });
    };

    const handleCreateUser = async (userData: CreateUserData) => {
        await createUser(userData, () => {
            setCreateUserModal(false);
            loadData(); // Reload all data to show new user
        });
    };

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

    const confirmDeletePhoto = async () => {
        if (!deleteConfirmation) return;

        const { imageId, userId } = deleteConfirmation;

        await deletePhoto(imageId, userId, (deletedImageId, affectedUserId) => {
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

            setDeleteConfirmation(null);
        });
    };

    const handleTogglePhotoPool = (
        imageId: string,
        userId: string,
        currentlyInPool: boolean
    ) => {
        togglePhotoPool(
            imageId,
            userId,
            currentlyInPool,
            (toggledImageId, affectedUserId, isInPool) => {
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
            }
        );
    };

    if (loading) {
        return <LoadingState message="Loading admin dashboard..." />;
    }

    if (error) {
        return (
            <AdminLayout title="Management">
                <div className="py-8 text-center">
                    <div className="text-lg text-red-600">Error: {error}</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Management">
            <UserTable
                users={paginatedUsers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                expandedUsers={expandedUsers}
                loadingDetails={loadingDetails}
                userDetails={userDetails}
                deleteLoading={deleteLoading}
                onToggleExpansion={toggleUserExpansion}
                onDeleteUser={handleDeleteUser}
                onPhotoClick={openPhotoModal}
                onDeletePhoto={handleDeletePhoto}
                deletingPhoto={deletingPhoto}
                onCreateUser={() => setCreateUserModal(true)}
            />

            {filteredUsers.length > 10 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={10}
                    onPageChange={setCurrentPage}
                />
            )}

            <PhotoModal
                photoModal={photoModal}
                onClose={() => setPhotoModal(null)}
                onTogglePool={handleTogglePhotoPool}
                onDeletePhoto={handleDeletePhoto}
                togglingPool={togglingPool}
                deletingPhoto={deletingPhoto}
                userDetails={userDetails}
            />

            <CreateUserModal
                isOpen={createUserModal}
                onClose={() => setCreateUserModal(false)}
                onCreateUser={handleCreateUser}
                isLoading={createUserLoading}
            />

            <DeletePhotoModal
                deleteConfirmation={deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDeletePhoto}
                isDeleting={!!deletingPhoto}
            />

            <DeleteUserModal
                userDeleteConfirmation={userDeleteConfirmation}
                onClose={() => setUserDeleteConfirmation(null)}
                onProceedToFinal={proceedToFinalConfirmation}
                onBackToConfirm={backToConfirmation}
                onConfirm={confirmDeleteUser}
                isDeleting={!!deleteLoading}
            />
        </AdminLayout>
    );
};

export default ManagementPage;
