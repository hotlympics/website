import { useCallback, useState } from "react";
import { adminService } from "../../../services/admin-service";
import type { AdminStats, AdminUser } from "../../types/admin";

export const useUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [usersData, statsData] = await Promise.all([
                adminService.getUsers(),
                adminService.getStats(),
            ]);
            setUsers(usersData.users);
            setStats(statsData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load data"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshStats = useCallback(async () => {
        try {
            const newStats = await adminService.getStats();
            setStats(newStats);
        } catch (err) {
            console.error("Failed to refresh stats:", err);
        }
    }, []);

    return {
        users,
        setUsers,
        stats,
        loading,
        error,
        loadData,
        refreshStats,
    };
};
