interface UploadUrlResponse {
    success: boolean;
    imageId: string;
    uploadUrl: string;
    downloadUrl: string;
    fileName: string;
    message: string;
}

const getAuthToken = async (): Promise<string> => {
    const { auth } = await import("../config/firebase");
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }
    return user.getIdToken();
};

const requestUploadUrl = async (
    fileExtension: string = "jpg"
): Promise<UploadUrlResponse> => {
    const token = await getAuthToken();
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
};

const uploadToFirebase = async (
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
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
};

const confirmUpload = async (
    imageId: string,
    actualFileName: string
): Promise<void> => {
    const token = await getAuthToken();
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
};

export const uploadService = {
    requestUploadUrl,
    uploadToFirebase,
    confirmUpload,
};
