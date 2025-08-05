import { firebaseAuthService } from "./firebase-auth";

export interface RatingSubmission {
    winnerId: string;
    loserId: string;
}

export interface RatingResponse {
    success: boolean;
    message?: string;
}

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const submitRating = async (winnerId: string, loserId: string): Promise<boolean> => {
    try {
        const token = await firebaseAuthService.getIdToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${apiUrl}/ratings`, {
            method: "POST",
            headers,
            body: JSON.stringify({ winnerId, loserId }),
        });

        if (!response.ok) {
            console.error("Failed to submit rating:", response.statusText);
            return false;
        }

        const data = (await response.json()) as RatingResponse;
        return data.success;
    } catch (error) {
        console.error("Error submitting rating:", error);
        return false;
    }
};

export const ratingService = {
    submitRating,
};
