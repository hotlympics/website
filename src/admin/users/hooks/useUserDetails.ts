import { useCallback, useState } from "react";
import { adminService } from "../../../services/admin-service";
import type { UserDetails } from "../../types/admin";

export const useUserDetails = () => {
    const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>(
        {}
    );
    const [loadingDetails, setLoadingDetails] = useState<Set<string>>(
        new Set()
    );
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

    const toggleUserExpansion = useCallback(
        async (userId: string) => {
            const isExpanded = expandedUsers.has(userId);

            if (isExpanded) {
                setExpandedUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            } else {
                setExpandedUsers((prev) => new Set(prev).add(userId));

                if (!userDetails[userId]) {
                    setLoadingDetails((prev) => new Set(prev).add(userId));
                    try {
                        const details =
                            await adminService.getUserDetails(userId);
                        setUserDetails((prev) => ({
                            ...prev,
                            [userId]: details,
                        }));
                    } catch (err) {
                        console.error("Failed to load user details:", err);
                    } finally {
                        setLoadingDetails((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(userId);
                            return newSet;
                        });
                    }
                }
            }
        },
        [expandedUsers, userDetails]
    );

    const removeUserDetails = useCallback((userId: string) => {
        setExpandedUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
        setUserDetails((prev) => {
            const newDetails = { ...prev };
            delete newDetails[userId];
            return newDetails;
        });
    }, []);

    return {
        userDetails,
        setUserDetails,
        loadingDetails,
        expandedUsers,
        toggleUserExpansion,
        removeUserDetails,
    };
};
