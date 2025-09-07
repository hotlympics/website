import { useCallback, useState } from "react";
import { adminService } from "../../services/admin/admin-service";
import type { AdminUser } from "../../utils/types/admin/admin";

export const useUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const loadData = useCallback(
        async (startAfter?: string, replace: boolean = true) => {
            try {
                setLoading(true);
                setError("");
                const data = await adminService.getUsers(startAfter, 10);

                if (replace) {
                    setUsers(data.users);
                } else {
                    setUsers((prev) => [...prev, ...data.users]);
                }

                setNextCursor(data.nextCursor);
                setHasMore(data.hasMore);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load data"
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const loadNextPage = useCallback(async () => {
        if (nextCursor && hasMore) {
            await loadData(nextCursor, true);
        }
    }, [nextCursor, hasMore, loadData]);

    return {
        users,
        setUsers,
        loading,
        error,
        loadData,
        loadNextPage,
        hasMore,
        nextCursor,
    };
};
