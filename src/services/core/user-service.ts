import { firebaseAuthService } from "./firebase-auth";

export interface User {
    id: string;
    firebaseUid: string;
    email: string;
    googleId: string | null;
    gender: "unknown" | "male" | "female";
    dateOfBirth: Date | null;
    rateCount: number;
    uploadedImageIds: string[];
    poolImageIds: string[];
    displayName?: string | null;
    photoUrl?: string | null;
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getCurrentUser = async (): Promise<User | null> => {
    try {
        const token = await firebaseAuthService.getIdToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch user:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data as User;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const userService = {
    getCurrentUser,
};
