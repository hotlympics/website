import { useCallback, useState } from "react";
import { adminService } from "../../services/admin/admin-service";
import type { AdminUser } from "../../utils/types/admin/admin";

export const useUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const usersData = await adminService.getUsers();
            setUsers(usersData.users);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load data"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        setUsers,
        loading,
        error,
        loadData,
    };
};
