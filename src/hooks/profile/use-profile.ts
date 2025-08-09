import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CURRENT_TOS_VERSION } from "../../config/tos-config";
import { firebaseAuthService } from "../../services/auth/firebase-auth";
import { useAuth } from "../auth/use-auth";

interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    tosVersion?: string | null;
    tosAcceptedAt?: string | null;
    poolImageIds?: string[];
}

interface ProfileSetupData {
    gender: "unknown" | "male" | "female";
    dateOfBirth: string;
}

export const useProfile = () => {
    const navigate = useNavigate();
    const { user: firebaseUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchUserInfo = useCallback(async () => {
        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                navigate("/signin?redirect=/profile");
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user`,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else if (response.status === 401) {
                navigate("/signin?redirect=/profile");
                return;
            }
        } catch (err) {
            console.error("Failed to fetch user info:", err);
        }
    }, [navigate]);

    useEffect(() => {
        if (authLoading) return;

        if (!firebaseUser) {
            navigate("/signin?redirect=/profile");
            return;
        }

        fetchUserInfo();
    }, [firebaseUser, authLoading, navigate, fetchUserInfo]);

    const updateProfile = async (profileData: ProfileSetupData) => {
        setIsUpdatingProfile(true);
        setError(null);

        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        gender: profileData.gender,
                        dateOfBirth: profileData.dateOfBirth,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error?.message || "Failed to update profile"
                );
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update profile"
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const logout = async () => {
        try {
            await firebaseAuthService.signOut();
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
            navigate("/signin");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const navigateToHome = () => {
        navigate("/");
    };

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const clearError = () => setError(null);

    const isProfileComplete = () => {
        return (
            user &&
            user.gender &&
            user.gender !== "unknown" &&
            user.dateOfBirth &&
            user.tosVersion === CURRENT_TOS_VERSION
        );
    };

    const needsGenderAndDob = () => {
        return (
            !user ||
            !user.gender ||
            user.gender === "unknown" ||
            !user.dateOfBirth
        );
    };

    const needsTosAcceptance = () => {
        return (
            !!user &&
            (!user.tosVersion || user.tosVersion !== CURRENT_TOS_VERSION)
        );
    };

    const acceptTos = async () => {
        setError(null);
        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user/accept-tos`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        tosVersion: CURRENT_TOS_VERSION,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error?.message || "Failed to accept Terms of Service"
                );
            }

            const result = await response.json();
            if (result.user) {
                setUser(result.user);
            }
            return true;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to accept Terms of Service"
            );
            return false;
        }
    };

    return {
        user,
        authLoading,
        isUpdatingProfile,
        error,
        successMessage,
        updateProfile,
        acceptTos,
        logout,
        navigateToHome,
        showSuccessMessage,
        clearError,
        isProfileComplete: isProfileComplete(),
        needsGenderAndDob: needsGenderAndDob(),
        needsTosAcceptance: needsTosAcceptance(),
        refreshUserInfo: fetchUserInfo,
    };
};
