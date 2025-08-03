import { firebaseAuthService } from "./firebase-auth";

export interface ImageData {
    imageId: string;
    userId: string;
    imageUrl: string;
    gender: "male" | "female";
    dateOfBirth: Date;
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    eloScore: number;
    inPool: boolean;
}

export interface ImagePairResponse {
    success: boolean;
    images: ImageData[];
}

class ImageService {
    private apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    async fetchImagePair(
        gender: "male" | "female"
    ): Promise<ImageData[] | null> {
        try {
            const token = await firebaseAuthService.getIdToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${this.apiUrl}/images/pairs/${gender}`,
                {
                    headers,
                }
            );

            if (!response.ok) {
                console.error(
                    "Failed to fetch image pair:",
                    response.statusText
                );
                return null;
            }

            const data = (await response.json()) as ImagePairResponse;
            return data.success ? data.images : null;
        } catch (error) {
            console.error("Error fetching image pair:", error);
            return null;
        }
    }
}

export const imageService = new ImageService();
