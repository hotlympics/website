import React, { useEffect, useState } from "react";
import { AuthUser, firebaseAuthService } from "../services/auth/firebase-auth";
import { imageQueueService } from "../services/core/image-queue-service.js";
import { viewingPreferenceService } from "../services/core/viewing-preference-service.js";
import { AuthContext } from "./auth-context-definition";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let previousUser: AuthUser | null = null;
        
        const unsubscribe = firebaseAuthService.onAuthStateChanged(
            (authUser) => {
                const wasLoggedIn = previousUser !== null;
                const isNowLoggedIn = authUser !== null;
                
                // Clear cache on login/logout (but not on initial load)
                if (previousUser !== undefined) { // Skip initial load
                    if (wasLoggedIn !== isNowLoggedIn) {
                        imageQueueService.clearQueueCache();
                        viewingPreferenceService.clearAllCaches();
                    }
                }
                
                previousUser = authUser;
                setUser(authUser);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []); // Remove user dependency

    const signOut = async () => {
        imageQueueService.clearQueueCache();
        viewingPreferenceService.clearAllCaches();
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
