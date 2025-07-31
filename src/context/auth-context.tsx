import React, { useEffect, useState } from "react";
import { AuthUser, firebaseAuthService } from "../services/firebase-auth";
import { AuthContext } from "./auth-context-definition";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebaseAuthService.onAuthStateChanged(
            (authUser) => {
                setUser(authUser);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const signOut = async () => {
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
