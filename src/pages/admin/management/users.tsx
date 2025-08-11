import { useEffect } from "react";
import Pagination from "../../../components/admin/shared/pagination";
import DeletePhotoModal from "../../../components/admin/shared/delete-photo-modal";
import PhotoModal from "../../../components/admin/shared/photo-modal";
import CreateUserModal from "../../../components/admin/management/users/create-user-modal";
import DeleteUserModal from "../../../components/admin/management/users/delete-user-modal";
import UserTable from "../../../components/admin/management/users/user-table";
import { usePagination } from "../../../hooks/admin/use-pagination";
import { usePhotoActions } from "../../../hooks/admin/use-photo-actions";
import { useSearch } from "../../../hooks/admin/use-search";
import { useUserActions } from "../../../hooks/admin/use-user-actions";
import { useUserDetails } from "../../../hooks/admin/use-user-details";
import { useUsers } from "../../../hooks/admin/use-users";
import {
    createPhotoDeleteHandlers,
    createPhotoModalHandlers,
    type PhotoDeleteConfirmation,
    updateStateAfterPhotoDelete,
    updateStateAfterPhotoPoolToggle,
} from "../../../utils/admin/photo-utils";
import {
    createUserCreationHandlers,
    createUserDeleteHandlers,
    updateStateAfterUserDelete,
    type UserDeleteConfirmation,
} from "../../../utils/admin/user-utils";
import type {
    AdminUser,
    CreateUserData,
    PhotoModalData,
} from "../../../utils/types/admin/admin";

interface UsersTabProps {
    photoModal: PhotoModalData | null;
    setPhotoModal: (data: PhotoModalData | null) => void;
    createUserModal: boolean;
    setCreateUserModal: (open: boolean) => void;
    deleteConfirmation: PhotoDeleteConfirmation | null;
    setDeleteConfirmation: (data: PhotoDeleteConfirmation | null) => void;
    userDeleteConfirmation: UserDeleteConfirmation | null;
    setUserDeleteConfirmation: (data: UserDeleteConfirmation | null) => void;
    onNavigateToBattles: (imageId: string) => void;
}

const UsersTab = ({
    photoModal,
    setPhotoModal,
    createUserModal,
    setCreateUserModal,
    deleteConfirmation,
    setDeleteConfirmation,
    userDeleteConfirmation,
    setUserDeleteConfirmation,
    onNavigateToBattles,
}: UsersTabProps) => {
    const { users, setUsers, loading, error, loadData, refreshStats } =
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

    // Create utility handlers
    const { openPhotoModal } = createPhotoModalHandlers(
        userDetails,
        setPhotoModal
    );
    const { handleDeletePhoto } = createPhotoDeleteHandlers(
        userDetails,
        setDeleteConfirmation
    );
    const { handleDeleteUser, proceedToFinalConfirmation, backToConfirmation } =
        createUserDeleteHandlers(setUserDeleteConfirmation);
    const { handleCreateUser: createUserHandler, openCreateUserModal } =
        createUserCreationHandlers(setCreateUserModal);

    const proceedToFinalConfirmationHandler = () => {
        const updated = proceedToFinalConfirmation(userDeleteConfirmation);
        if (updated) setUserDeleteConfirmation(updated);
    };

    const backToConfirmationHandler = () => {
        const updated = backToConfirmation(userDeleteConfirmation);
        if (updated) setUserDeleteConfirmation(updated);
    };

    const confirmDeleteUser = async () => {
        if (!userDeleteConfirmation) return;

        const { userId } = userDeleteConfirmation;

        await deleteUser(userId, (deletedUserId) => {
            updateStateAfterUserDelete(
                deletedUserId,
                setUsers,
                users,
                removeUserDetails,
                refreshStats,
                setUserDeleteConfirmation
            );
        });
    };

    const handleCreateUserWrapper = async (userData: CreateUserData) => {
        return createUserHandler(userData, createUser, loadData);
    };

    const confirmDeletePhoto = async () => {
        if (!deleteConfirmation) return;

        const { imageId, userId } = deleteConfirmation;

        await deletePhoto(imageId, userId, (deletedImageId, affectedUserId) => {
            updateStateAfterPhotoDelete(
                deletedImageId,
                affectedUserId,
                setUserDetails,
                setUsers,
                photoModal,
                setPhotoModal
            );
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
                updateStateAfterPhotoPoolToggle(
                    toggledImageId,
                    affectedUserId,
                    isInPool,
                    setUserDetails,
                    setUsers,
                    users,
                    photoModal,
                    setPhotoModal
                );
            }
        );
    };

    if (loading) {
        return (
            <div className="py-8 text-center">
                <div className="text-lg text-gray-600">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8 text-center">
                <div className="text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <>
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
                onCreateUser={openCreateUserModal}
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
                onNavigateToBattles={onNavigateToBattles}
                togglingPool={togglingPool}
                deletingPhoto={deletingPhoto}
                userDetails={userDetails}
            />

            <CreateUserModal
                isOpen={createUserModal}
                onClose={() => setCreateUserModal(false)}
                onCreateUser={handleCreateUserWrapper}
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
                onProceedToFinal={proceedToFinalConfirmationHandler}
                onBackToConfirm={backToConfirmationHandler}
                onConfirm={confirmDeleteUser}
                isDeleting={!!deleteLoading}
            />
        </>
    );
};

export default UsersTab;
