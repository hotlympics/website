interface UploadUrlResponse {
    success: boolean;
    imageId: string;
    uploadUrl: string;
    downloadUrl: string;
    fileName: string;
    message: string;
}

class DirectUploadService {
    async requestUploadUrl(fileExtension: string = 'jpg'): Promise<UploadUrlResponse> {
        const token = await this.getAuthToken();
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/images/request-upload`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fileExtension }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.error?.message || "Failed to request upload URL"
            );
        }

        return response.json();
    }

    async uploadToFirebase(
        file: File,
        uploadUrl: string,
        onProgress?: (progress: number) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    resolve();
                } else {
                    reject(
                        new Error(`Upload failed with status ${xhr.status}`)
                    );
                }
            });

            xhr.addEventListener("error", () => {
                reject(new Error("Upload failed"));
            });

            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });
    }

    async confirmUpload(
        imageId: string,
        actualFileName: string
    ): Promise<void> {
        const token = await this.getAuthToken();
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/images/confirm-upload/${imageId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ actualFileName }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Failed to confirm upload");
        }
    }

    private async getAuthToken(): Promise<string> {
        const { auth } = await import("../config/firebase");
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User not authenticated");
        }
        return user.getIdToken();
    }
}

export const uploadService = new DirectUploadService();
