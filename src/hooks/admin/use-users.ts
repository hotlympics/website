import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/admin/admin-service";
import type { AdminUser } from "../../utils/types/admin/admin";

export const useUsers = (initialSearchEmail?: string) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [prevCursor, setPrevCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [currentPageStart, setCurrentPageStart] = useState<string | null>(
        null
    );
    const [searchEmail, setSearchEmail] = useState(initialSearchEmail || "");
    const [activeSearchTerm, setActiveSearchTerm] = useState(initialSearchEmail || ""); // The actual search term being used
    const [isSearchMode, setIsSearchMode] = useState(!!initialSearchEmail);

    const loadData = useCallback(
        async (
            startAfter?: string,
            endBefore?: string,
            searchTerm?: string
        ) => {
            try {
                setLoading(true);
                setError("");

                const searchToUse =
                    searchTerm !== undefined ? searchTerm : activeSearchTerm;
                const data = await adminService.getUsers(
                    startAfter,
                    10,
                    endBefore,
                    searchToUse
                );

                setUsers(data.users);
                setNextCursor(data.nextCursor);
                setPrevCursor(data.prevCursor);
                setHasMore(data.hasMore);
                setHasPrevious(data.hasPrevious);
                setIsSearchMode(!!(searchToUse && searchToUse.trim()));

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
        [activeSearchTerm]
    );

    const performSearch = useCallback(
        async (searchTerm: string) => {
            setActiveSearchTerm(searchTerm);
            await loadData(undefined, undefined, searchTerm);
        },
        [loadData]
    );

    const clearSearch = useCallback(async () => {
        setSearchEmail("");
        setActiveSearchTerm("");
        setIsSearchMode(false);
        await loadData(undefined, undefined, "");
    }, [loadData]);

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

    // Auto-load data on initialization
    useEffect(() => {
        // If we have an initial search email, load with that search
        // Otherwise, load default data
        loadData(undefined, undefined, initialSearchEmail || undefined);
    }, [loadData, initialSearchEmail]);

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
        searchEmail,
        setSearchEmail,
        activeSearchTerm,
        isSearchMode,
        performSearch,
        clearSearch,
    };
};
