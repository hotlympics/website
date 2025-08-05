import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import LoadingState from "../../components/ui/LoadingState";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { useSearch } from "../../hooks/useSearch";
import type {
    AdminUser,
    CreateUserData,
    PhotoModalData,
} from "../../types/admin";
import DeletePhotoModal from "./components/shared/DeletePhotoModal";
import PhotoModal from "./components/shared/PhotoModal";
import CreateUserModal from "./components/users/CreateUserModal";
import DeleteUserModal from "./components/users/DeleteUserModal";
import UserTable from "./components/users/UserTable";
import { usePhotoActions } from "./hooks/users/usePhotoActions";
import { useUserActions } from "./hooks/users/useUserActions";
import { useUserDetails } from "./hooks/users/useUserDetails";
import { useUsers } from "./hooks/users/useUsers";
import {
    createPhotoDeleteHandlers,
    createPhotoModalHandlers,
    type PhotoDeleteConfirmation,
    updateStateAfterPhotoDelete,
    updateStateAfterPhotoPoolToggle,
} from "./utils/photoUtils";
import {
    createUserCreationHandlers,
    createUserDeleteHandlers,
    type UserDeleteConfirmation,
    updateStateAfterUserDelete,
} from "./utils/userUtils";

type ManagementTab = "users" | "moderation" | "battles";

const ManagementPage = () => {
    const [activeTab, setActiveTab] = useState<ManagementTab>("users");
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

    // Local state for modals and confirmations
    const [photoModal, setPhotoModal] = useState<PhotoModalData | null>(null);
    const [createUserModal, setCreateUserModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<PhotoDeleteConfirmation | null>(null);
    const [userDeleteConfirmation, setUserDeleteConfirmation] = useState<UserDeleteConfirmation | null>(null);

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
    const { openPhotoModal } = createPhotoModalHandlers(userDetails, setPhotoModal);
    const { handleDeletePhoto } = createPhotoDeleteHandlers(userDetails, setDeleteConfirmation);
    const { handleDeleteUser, proceedToFinalConfirmation, backToConfirmation } = createUserDeleteHandlers(setUserDeleteConfirmation);
    const { handleCreateUser: createUserHandler, openCreateUserModal } = createUserCreationHandlers(setCreateUserModal);

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

    const tabs: { id: ManagementTab; label: string }[] = [
        { id: "users", label: "Users" },
        { id: "moderation", label: "Moderation" },
        { id: "battles", label: "Battles" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "users":
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
                    </>
                );
            case "moderation":
                return (
                    <div className="bg-white shadow sm:rounded-md p-6">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Moderation</h3>
                            <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                        </div>
                    </div>
                );
            case "battles":
                return (
                    <div className="bg-white shadow sm:rounded-md p-6">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Battle Management</h3>
                            <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout title="Management">
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {renderTabContent()}

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
        </AdminLayout>
    );
};

export default ManagementPage;
