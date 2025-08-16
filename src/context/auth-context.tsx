import React, { useEffect, useState } from "react";
import { AuthUser, firebaseAuthService } from "../services/auth/firebase-auth";
import { cacheManager } from "../services/cache/cache-manager.js";
import { viewingPreferenceService } from "../services/cache/viewing-preferences.js";
import { imageQueueService } from "../services/core/image-queue.js";
import { AuthContext } from "./auth-context-definition";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let previousUser: AuthUser | null | undefined = undefined;

        const unsubscribe = firebaseAuthService.onAuthStateChanged(
            (authUser) => {
                const wasLoggedIn = previousUser !== null;
                const isNowLoggedIn = authUser !== null;

                // Clear cache on login/logout (but not on initial load)
                if (previousUser !== undefined) {
                    // Skip initial load
                    if (wasLoggedIn !== isNowLoggedIn) {
                        imageQueueService.clearQueueCache();
                        viewingPreferenceService.clearAllCaches();
                        cacheManager.clearAllCaches();
                    }
                }

                previousUser = authUser;
                setUser(authUser);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []); // Remove user dependency

    // Initialize cache manager after auth is loaded
    useEffect(() => {
        if (!loading) {
            cacheManager.initialize();
        }
    }, [loading]);

    const signOut = async () => {
        imageQueueService.clearQueueCache();
        viewingPreferenceService.clearAllCaches();
        cacheManager.clearAllCaches();
        await firebaseAuthService.signOut();
        setUser(null);
    };

    const value = {
        user,
        loading,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
