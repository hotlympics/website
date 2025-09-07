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
    const [isFirstPage, setIsFirstPage] = useState(true);

    const loadData = useCallback(
        async (
            startAfter?: string,
            endBefore?: string
        ) => {
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

                // Track if this is the first page
                if (!startAfter && !endBefore) {
                    console.log("Setting isFirstPage to true");
                    setIsFirstPage(true);
                } else {
                    console.log("Setting isFirstPage to false", {
                        startAfter,
                        endBefore,
                    });
                    setIsFirstPage(false);
                }

                console.log("Load data complete", {
                    hasMore: data.hasMore,
                    nextCursor: data.nextCursor,
                    prevCursor: data.prevCursor,
                    isFirstPage: !startAfter && !endBefore,
                });
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
        if (prevCursor && !isFirstPage) {
            await loadData(undefined, prevCursor);
        }
    }, [prevCursor, isFirstPage, loadData]);

    return {
        users,
        setUsers,
        loading,
        error,
        loadData,
        loadNextPage,
        loadPreviousPage,
        hasMore,
        hasPrevious: !isFirstPage,
        nextCursor,
        prevCursor,
    };
};
