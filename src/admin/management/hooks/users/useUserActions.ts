import { useCallback, useState } from "react";
import { adminService } from "../../../../services/admin-service";
import type { CreateUserData } from "../../../types/admin";

export const useUserActions = () => {
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [createUserLoading, setCreateUserLoading] = useState(false);

    const deleteUser = useCallback(
        async (userId: string, onSuccess: (userId: string) => void) => {
            try {
                setDeleteLoading(userId);
                await adminService.deleteUser(userId);
                onSuccess(userId);
            } catch (err) {
                console.error("Error deleting user:", err);
                alert(
                    `Failed to delete user: ${err instanceof Error ? err.message : "Unknown error"}`
                );
            } finally {
                setDeleteLoading(null);
            }
        },
        []
    );

    const createUser = useCallback(
        async (userData: CreateUserData, onSuccess: () => void) => {
            if (!userData.email || !userData.gender || !userData.dateOfBirth) {
                alert(
                    "Please fill in all required fields (email, gender, date of birth)"
                );
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                alert("Please enter a valid email address");
                return;
            }

            const birthDate = new Date(userData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            if (age < 18) {
                alert("User must be at least 18 years old");
                return;
            }

            try {
                setCreateUserLoading(true);
                await adminService.createUser(userData);
                onSuccess();
            } catch (err) {
                console.error("Error creating user:", err);
                alert(
                    `Failed to create user: ${err instanceof Error ? err.message : "Unknown error"}`
                );
            } finally {
                setCreateUserLoading(false);
            }
        },
        []
    );

    return {
        deleteLoading,
        createUserLoading,
        deleteUser,
        createUser,
    };
};
