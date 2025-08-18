import { getApiUrl } from "../../utils/api";
import { firebaseAuthService } from "../auth/firebase-auth";

export interface ReactionResponse {
    success: boolean;
    message?: string;
}

class ReactionService {
    private apiUrl = getApiUrl();

    async submitReaction(
        imageId: string,
        reactionEmoji: string
    ): Promise<boolean> {
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
                body: JSON.stringify({ imageId, reactionEmoji }),
            });

            if (!response.ok) {
                console.error(
                    "Failed to submit reaction:",
                    response.statusText
                );
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

export const reactionService = new ReactionService();
