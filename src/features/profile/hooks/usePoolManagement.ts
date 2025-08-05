import { useState, useEffect } from "react";
import { firebaseAuthService } from "../../../services/firebase-auth";

interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    poolImageIds?: string[];
}

export const usePoolManagement = (user: UserInfo | null) => {
    const [poolSelections, setPoolSelections] = useState<Set<string>>(new Set());
    const [isUpdatingPool, setIsUpdatingPool] = useState(false);

    // Initialize pool selections from user's poolImageIds
    useEffect(() => {
        if (user?.poolImageIds) {
            setPoolSelections(new Set(user.poolImageIds));
        }
    }, [user]);

    const togglePoolSelection = (photoId: string, onError?: (error: string) => void) => {
        const newSelections = new Set(poolSelections);

        if (newSelections.has(photoId)) {
            newSelections.delete(photoId);
        } else {
            if (newSelections.size < 2) {
                newSelections.add(photoId);
            } else {
                onError?.("You can only select up to 2 images for the pool");
                return;
            }
        }

        setPoolSelections(newSelections);
    };

    const removeFromPool = (photoId: string) => {
        const newSelections = new Set(poolSelections);
        newSelections.delete(photoId);
        setPoolSelections(newSelections);
    };

    const updatePoolOnServer = async (
        onSuccess?: (user: UserInfo) => void,
        onError?: (error: string) => void
    ) => {
        setIsUpdatingPool(true);

        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user/pool`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        poolImageIds: Array.from(poolSelections),
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error?.message || "Failed to update pool"
                );
            }

            const updatedUser = await response.json();
            onSuccess?.(updatedUser);
        } catch (err) {
            onError?.(
                err instanceof Error ? err.message : "Failed to update pool"
            );
        } finally {
            setIsUpdatingPool(false);
        }
    };

    const hasPoolChanges = () => {
        return (
            poolSelections.size !== (user?.poolImageIds?.length || 0) ||
            !Array.from(poolSelections).every((id) =>
                user?.poolImageIds?.includes(id)
            )
        );
    };

    return {
        poolSelections,
        isUpdatingPool,
        togglePoolSelection,
        removeFromPool,
        updatePoolOnServer,
        hasPoolChanges: hasPoolChanges(),
    };
};