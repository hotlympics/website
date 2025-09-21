import { useCallback, useState } from "react";
import { uploadService } from "../../services/core/upload";
import {
    compressImage,
    validateImageFile,
} from "../../utils/shared/image-compression";

interface GlickoState {
    rating: number;
    rd: number;
    volatility: number;
    mu: number;
    phi: number;
    lastUpdateAt: unknown;
    systemVersion: number;
}

export interface UploadedPhoto {
    id: string;
    url: string;
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    glicko: GlickoState;
    inPool: boolean;
    status: "pending" | "active" | undefined;
    gender: "male" | "female";
    dateOfBirth: unknown;
    createdAt: unknown;
    uploadedAt?: unknown;
    randomSeed: number;
}

export const usePhotoUpload = () => {
    const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchUploadedPhotos = useCallback(async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/user/withmetadata`,
                {
                    headers: {
                        Authorization: `Bearer ${await getIdToken()}`,
                    },
                }
            );

            if (response.ok) {
                const photos = await response.json();
                console.log(
                    "API Response for user photos with metadata:",
                    photos
                );
                setUploadedPhotos(photos);
            }
        } catch (err) {
            console.error("Failed to fetch photos:", err);
        }
    }, []);

    const uploadPhoto = async (
        file: File,
        onSuccess?: (message: string) => void,
        onError?: (error: string) => void
    ) => {
        if (uploadedPhotos.length >= 10) {
            onError?.("You've reached the maximum limit of 10 photos");
            return;
        }

        const validation = validateImageFile(file);
        if (!validation.valid) {
            onError?.(validation.error!);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus("Compressing image...");

        try {
            const compressedFile = await compressImage(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            });

            const mimeType = compressedFile.type;
            let extension = "jpg";
            if (mimeType === "image/png") extension = "png";
            else if (mimeType === "image/gif") extension = "gif";
            else if (mimeType === "image/webp") extension = "webp";
            else if (mimeType === "image/jpeg" || mimeType === "image/jpg")
                extension = "jpg";

            setUploadStatus("Requesting upload permission...");
            const { uploadUrl, downloadUrl, imageId, fileName } =
                await uploadService.requestUploadUrl(extension);

            setUploadStatus("Uploading to cloud...");
            await uploadService.uploadToFirebase(
                compressedFile,
                uploadUrl,
                (progress) => setUploadProgress(progress)
            );

            setUploadStatus("Finalizing upload...");
            await uploadService.confirmUpload(imageId, fileName);

            const uploadedPhoto: UploadedPhoto = {
                id: imageId,
                url: downloadUrl,
                battles: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                glicko: {
                    rating: 1500,
                    rd: 350,
                    volatility: 0.06,
                    mu: 0,
                    phi: 2.014,
                    lastUpdateAt: new Date(),
                    systemVersion: 2,
                },
                inPool: false,
                status: "pending",
                gender: "male", // This will be updated when we fetch from server
                dateOfBirth: new Date(),
                createdAt: new Date(),
                uploadedAt: new Date(),
                randomSeed: Math.random(),
            };

            setUploadedPhotos([uploadedPhoto, ...uploadedPhotos]);
            onSuccess?.("Photo uploaded successfully!");
        } catch (error) {
            onError?.(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
            setUploadStatus("");
            setUploadProgress(0);
        }
    };

    const deletePhoto = async (
        photoId: string,
        onError?: (error: string) => void
    ) => {
        const previousPhotos = [...uploadedPhotos];
        setUploadedPhotos(
            uploadedPhotos.filter((photo) => photo.id !== photoId)
        );
        setIsDeleting(photoId);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/${photoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${await getIdToken()}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Delete failed");
            }
        } catch (error) {
            setUploadedPhotos(previousPhotos);
            onError?.(
                `Failed to delete photo: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        } finally {
            setIsDeleting(null);
        }
    };

    const removePhotoFromList = (photoId: string) => {
        setUploadedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    };

    return {
        uploadedPhotos,
        setUploadedPhotos,
        isUploading,
        uploadStatus,
        uploadProgress,
        isDeleting,
        fetchUploadedPhotos,
        uploadPhoto,
        deletePhoto,
        removePhotoFromList,
    };
};

// Helper function to get ID token - this should be moved to a shared location
const getIdToken = async () => {
    // This will need to import from the appropriate auth service
    const { firebaseAuthService } = await import(
        "../../services/auth/firebase-auth"
    );
    return firebaseAuthService.getIdToken();
};
