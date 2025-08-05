import { firebaseAuthService } from "../../../services/firebase-auth.js";

export const syncUserWithBackend = async (firebaseUid: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const idToken = await firebaseAuthService.getIdToken();

    if (!idToken) {
        throw new Error("Failed to get authentication token");
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/sync`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ firebaseUid }),
    });

    if (!response.ok) {
        let errorMessage = "Failed to sync with backend";
        try {
            const errorData = await response.json();
            console.error("Sync failed:", errorData);
            errorMessage =
                typeof errorData.error === "string"
                    ? errorData.error
                    : errorData.message || errorMessage;
        } catch (e) {
            console.error("Failed to parse error response:", e);
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    localStorage.setItem("user_info", JSON.stringify(data.user));
};
