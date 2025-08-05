import type { AdminUser, CreateUserData } from "../types/admin";

export interface UserDeleteConfirmation {
    userId: string;
    userEmail: string;
    step: "confirm" | "final";
}

// User deletion utilities
export const createUserDeleteHandlers = (
    setUserDeleteConfirmation: (
        confirmation: UserDeleteConfirmation | null
    ) => void
) => {
    const handleDeleteUser = (userId: string, userEmail: string) => {
        setUserDeleteConfirmation({
            userId,
            userEmail,
            step: "confirm",
        });
    };

    const proceedToFinalConfirmation = (
        currentConfirmation: UserDeleteConfirmation | null
    ) => {
        if (!currentConfirmation) return null;
        return {
            ...currentConfirmation,
            step: "final" as const,
        };
    };

    const backToConfirmation = (
        currentConfirmation: UserDeleteConfirmation | null
    ) => {
        if (!currentConfirmation) return null;
        return {
            ...currentConfirmation,
            step: "confirm" as const,
        };
    };

    return {
        handleDeleteUser,
        proceedToFinalConfirmation,
        backToConfirmation,
    };
};

// User creation utilities
export const createUserCreationHandlers = (
    setCreateUserModal: (open: boolean) => void
) => {
    const handleCreateUser = (
        userData: CreateUserData,
        createUser: (
            data: CreateUserData,
            callback: () => void
        ) => Promise<void>,
        loadData: () => void
    ) => {
        return createUser(userData, () => {
            setCreateUserModal(false);
            loadData(); // Reload all data to show new user
        });
    };

    const openCreateUserModal = () => setCreateUserModal(true);
    const closeCreateUserModal = () => setCreateUserModal(false);

    return {
        handleCreateUser,
        openCreateUserModal,
        closeCreateUserModal,
    };
};

// State update utilities for user operations
export const updateStateAfterUserDelete = (
    deletedUserId: string,
    setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>,
    users: AdminUser[],
    removeUserDetails: (userId: string) => void,
    refreshStats: () => void,
    setUserDeleteConfirmation: (
        confirmation: UserDeleteConfirmation | null
    ) => void
) => {
    // Remove user from local state
    setUsers(users.filter((user) => user.id !== deletedUserId));
    removeUserDetails(deletedUserId);

    // Refresh stats and close modal
    refreshStats();
    setUserDeleteConfirmation(null);
};
