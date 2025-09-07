import { useCallback, useState } from "react";
import { adminService } from "../../services/admin/admin-service";
import type { AdminUser } from "../../utils/types/admin/admin";

export const useUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [currentPageStart, setCurrentPageStart] = useState<string | null>(null); // Track where current page starts

    const loadData = useCallback(
        async (startAfter?: string, endBefore?: string) => {
            try {
                setLoading(true);
                setError("");
                const data = await adminService.getUsers(
                    startAfter,
                    10,
                    endBefore
                );

                setUsers(data.users);
                setNextCursor(data.nextCursor);
                setPrevCursor(data.prevCursor);
                setHasMore(data.hasMore);
                setHasPrevious(data.hasPrevious);

                // Track where this page starts
                if (data.users.length > 0) {
                    setCurrentPageStart(data.users[0].id);
                } else {
                    setCurrentPageStart(null);
                }
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
            await loadData(nextCursor);
        }
    }, [nextCursor, hasMore, loadData]);

    const loadPreviousPage = useCallback(async () => {
        if (currentPageStart && hasPrevious) {
            // Use endBefore with the first user of current page to get previous page
            await loadData(undefined, currentPageStart);
        }
    }, [currentPageStart, hasPrevious, loadData]);

    return {
        users,
        setUsers,
        loading,
        error,
        loadData,
        loadNextPage,
        loadPreviousPage,
        hasMore,
        hasPrevious,
        nextCursor,
        prevCursor,
    };
};
