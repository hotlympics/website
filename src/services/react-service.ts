import { firebaseAuthService } from "./firebase-auth";

export interface ReactionResponse {
    success: boolean;
    message?: string;
}

class ReactionService {
    private apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    async submitReaction(imageId: string, userId: string, reactionEmoji: string): Promise<boolean> {
        try {
            const token = await firebaseAuthService.getIdToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.apiUrl}/reactions`, {
                method: "POST",
                headers,
                body: JSON.stringify({ imageId, userId, reactionEmoji }),
            });

            if (!response.ok) {
                console.error("Failed to submit reaction:", response.statusText);
                return false;
            }

            const data = (await response.json()) as ReactionResponse;
            return data.success;
        } catch (error) {
            console.error("Error submitting reaction:", error);
            return false;
        }
    }
}

export const reactingService = new ReactionService();
