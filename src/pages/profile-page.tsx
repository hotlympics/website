import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { firebaseAuthService } from "../services/firebase-auth";
import { uploadService } from "../services/upload-service";
import { compressImage, validateImageFile } from "../utils/image-compression";

interface UploadedPhoto {
    id: string;
    url: string;
    uploadedAt: string;
    inPool?: boolean;
}

interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    poolImageIds?: string[];
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: firebaseUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [profileForm, setProfileForm] = useState({
        gender: "unknown" as "unknown" | "male" | "female",
        dateOfBirth: "",
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [poolSelections, setPoolSelections] = useState<Set<string>>(
        new Set()
    );
    const [isUpdatingPool, setIsUpdatingPool] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        photoId: string;
        isInPool: boolean;
    } | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!firebaseUser) {
            navigate("/signin?redirect=/profile");
            return;
        }

        // Fetch user info from backend using Firebase auth
        const fetchUserInfo = async () => {
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
                    // Initialize pool selections from user's poolImageIds
                    if (userData.poolImageIds) {
                        setPoolSelections(new Set(userData.poolImageIds));
                    }
                } else if (response.status === 401) {
                    navigate("/signin?redirect=/profile");
                    return;
                }
            } catch (err) {
                console.error("Failed to fetch user info:", err);
            }
        };

        fetchUserInfo();
        fetchUploadedPhotos();
    }, [firebaseUser, authLoading, navigate]);

    const fetchUploadedPhotos = async () => {
        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) return;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/user`,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.ok) {
                const photos = await response.json();
                // Photos already have signed URLs, no need to modify
                setUploadedPhotos(photos);
            }
        } catch (err) {
            console.error("Failed to fetch photos:", err);
        }
    };

    const handleLogout = async () => {
        try {
            await firebaseAuthService.signOut();
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
            navigate("/signin");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check upload limit
        if (uploadedPhotos.length >= 10) {
            setError("You've reached the maximum limit of 10 photos");
            return;
        }

        // Validate file before compression
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error!);
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);
        setUploadStatus("Compressing image...");

        try {
            // Compress the image
            const compressedFile = await compressImage(file, {
                maxSizeMB: 0.5, // Compress to max 500KB
                maxWidthOrHeight: 1280, // Max dimension 1280px
                useWebWorker: true,
            });

            // Direct upload to Firebase Storage
            // Extract extension from compressed file
            const mimeType = compressedFile.type;
            let extension = "jpg"; // default
            if (mimeType === "image/png") extension = "png";
            else if (mimeType === "image/gif") extension = "gif";
            else if (mimeType === "image/webp") extension = "webp";
            else if (mimeType === "image/jpeg" || mimeType === "image/jpg")
                extension = "jpg";

            // Request upload URL from server
            setUploadStatus("Requesting upload permission...");
            const { uploadUrl, downloadUrl, imageId, fileName } =
                await uploadService.requestUploadUrl(extension);

            // Upload directly to Firebase Storage
            setUploadStatus("Uploading to cloud...");
            await uploadService.uploadToFirebase(
                compressedFile,
                uploadUrl,
                (progress) => setUploadProgress(progress)
            );

            // Confirm upload with server
            setUploadStatus("Finalizing upload...");
            await uploadService.confirmUpload(imageId, fileName);

            // Create photo object immediately
            const uploadedPhoto = {
                id: imageId,
                url: downloadUrl,
                uploadedAt: new Date().toISOString(),
            };

            setUploadedPhotos([uploadedPhoto, ...uploadedPhotos]);

            setSuccessMessage("Photo uploaded successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);

            // Reset file input
            event.target.value = "";
        } catch (error) {
            setError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
            setUploadStatus("");
            setUploadProgress(0);
        }
    };

    const handleDeletePhoto = (photoId: string) => {
        // Show confirmation modal
        const isInPool = poolSelections.has(photoId);
        setDeleteConfirmation({ photoId, isInPool });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { photoId } = deleteConfirmation;
        setDeleteConfirmation(null);

        // Optimistic update - immediately remove from UI
        const previousPhotos = [...uploadedPhotos];

        setUploadedPhotos(
            uploadedPhotos.filter((photo) => photo.id !== photoId)
        );

        // Also remove from pool selections
        const newSelections = new Set(poolSelections);
        newSelections.delete(photoId);
        setPoolSelections(newSelections);

        setIsDeleting(photoId);
        setError(null);

        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/${photoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Delete failed");
            }

            // Success - photo is already removed from UI, nothing to do
        } catch (error) {
            // Restore the photo on error
            setUploadedPhotos(previousPhotos);
            setError(
                `Failed to delete photo: ${error instanceof Error ? error.message : "Unknown error"}`
            );

            // Show a temporary error message that auto-dismisses
            setTimeout(() => {
                setError(null);
            }, 5000);
        } finally {
            setIsDeleting(null);
        }
    };

    const isProfileComplete = () => {
        return (
            user && user.gender && user.gender !== "unknown" && user.dateOfBirth
        );
    };

    const handlePoolToggle = (photoId: string) => {
        const newSelections = new Set(poolSelections);

        if (newSelections.has(photoId)) {
            // Remove from pool
            newSelections.delete(photoId);
        } else {
            // Add to pool (max 2)
            if (newSelections.size < 2) {
                newSelections.add(photoId);
            } else {
                setError("You can only select up to 2 images for the pool");
                setTimeout(() => setError(null), 3000);
                return;
            }
        }

        setPoolSelections(newSelections);
    };

    const handlePoolUpdate = async () => {
        setIsUpdatingPool(true);
        setError(null);

        try {
            const idToken = await firebaseAuthService.getIdToken();
            if (!idToken) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/user/pool`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        poolImageIds: Array.from(poolSelections),
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error?.message || "Failed to update pool"
                );
            }

            const updatedUser = await response.json();
            setUser(updatedUser);

            // Show success message
            setSuccessMessage("Pool selections updated successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update pool"
            );
        } finally {
            setIsUpdatingPool(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
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
                        gender: profileForm.gender,
                        dateOfBirth: profileForm.dateOfBirth,
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

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If profile is not complete, show setup form
    if (!isProfileComplete()) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-md px-4 py-8">
                    <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
                        Complete Your Profile
                    </h1>

                    <div className="rounded-lg bg-white p-8 shadow-md">
                        <p className="mb-6 text-center text-gray-600">
                            Please provide your gender and date of birth to
                            continue.
                        </p>

                        <form
                            onSubmit={handleProfileUpdate}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="gender"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    value={profileForm.gender}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            gender: e.target.value as
                                                | "male"
                                                | "female",
                                        })
                                    }
                                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="unknown" disabled>
                                        Select your gender
                                    </option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="dateOfBirth"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    value={profileForm.dateOfBirth}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            dateOfBirth: e.target.value,
                                        })
                                    }
                                    max={new Date().toISOString().split("T")[0]}
                                    className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <p className="text-sm text-red-800">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={
                                        isUpdatingProfile ||
                                        profileForm.gender === "unknown" ||
                                        !profileForm.dateOfBirth
                                    }
                                    className={`flex-1 rounded-md px-4 py-2 font-medium text-white ${
                                        isUpdatingProfile ||
                                        profileForm.gender === "unknown" ||
                                        !profileForm.dateOfBirth
                                            ? "cursor-not-allowed bg-gray-400"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isUpdatingProfile
                                        ? "Updating..."
                                        : "Save Profile"}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-md bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Normal account page content
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-gray-600 hover:text-gray-800"
                >
                    ← Back to rating arena
                </button>

                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Account
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Profile Info Card */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Profile Information
                        </h2>
                        <p className="text-gray-600">Email: {user.email}</p>
                    </div>

                    {/* Upload Photo Card */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Upload Photo
                        </h2>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="photo-upload"
                            onChange={handleFileSelect}
                            disabled={
                                isUploading || uploadedPhotos.length >= 10
                            }
                        />
                        <label
                            htmlFor="photo-upload"
                            className={`block w-full cursor-pointer rounded-md px-4 py-2 text-center text-white ${(() => {
                                if (
                                    isUploading ||
                                    uploadedPhotos.length >= 10
                                ) {
                                    return "cursor-not-allowed bg-gray-400";
                                }
                                return "bg-blue-600 hover:bg-blue-700";
                            })()}`}
                        >
                            {(() => {
                                if (isUploading) {
                                    return uploadStatus || "Uploading...";
                                }
                                if (uploadedPhotos.length >= 10) {
                                    return "Upload Limit Reached";
                                }
                                return "Choose Photo";
                            })()}
                        </label>
                        {isUploading && uploadProgress > 0 && (
                            <div className="mt-2">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-center text-xs text-gray-600">
                                    {Math.round(uploadProgress)}%
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Uploaded Photos Section */}
                <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Uploaded Photos
                        </h2>
                        <span className="text-sm text-gray-500">
                            {uploadedPhotos.length}/10 photos
                        </span>
                    </div>

                    {/* Pool Selection Button */}
                    {uploadedPhotos.length > 0 && (
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Select up to 2 photos for the rating pool (
                                {poolSelections.size}/2 selected)
                            </p>
                            <button
                                onClick={handlePoolUpdate}
                                disabled={
                                    isUpdatingPool ||
                                    (poolSelections.size ===
                                        (user?.poolImageIds?.length || 0) &&
                                        Array.from(poolSelections).every((id) =>
                                            user?.poolImageIds?.includes(id)
                                        ))
                                }
                                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                                    isUpdatingPool ||
                                    (poolSelections.size ===
                                        (user?.poolImageIds?.length || 0) &&
                                        Array.from(poolSelections).every((id) =>
                                            user?.poolImageIds?.includes(id)
                                        ))
                                        ? "cursor-not-allowed bg-gray-400"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {isUpdatingPool
                                    ? "Updating..."
                                    : "Save Pool Selection"}
                            </button>
                        </div>
                    )}
                    {uploadedPhotos.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No photos uploaded yet
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {uploadedPhotos.map((photo) => {
                                const isInPool = poolSelections.has(photo.id);
                                return (
                                    <div
                                        key={photo.id}
                                        className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${
                                            isDeleting === photo.id
                                                ? "opacity-50"
                                                : ""
                                        } ${isInPool ? "ring-4 ring-green-500" : ""}`}
                                        onClick={() =>
                                            handlePoolToggle(photo.id)
                                        }
                                    >
                                        <img
                                            src={photo.url}
                                            alt="Uploaded photo"
                                            className="h-full w-full object-cover"
                                            onError={() => {
                                                // Remove images that fail to load (e.g., deleted from GCS)
                                                console.log(
                                                    `Failed to load image ${photo.id}. Removing from list.`
                                                );
                                                setUploadedPhotos((prev) =>
                                                    prev.filter(
                                                        (p) => p.id !== photo.id
                                                    )
                                                );
                                            }}
                                        />

                                        {/* Pool indicator */}
                                        {isInPool && (
                                            <div className="absolute top-2 left-2 rounded-full bg-green-500 p-2 text-white">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {isDeleting === photo.id && (
                                            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white"></div>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePhoto(photo.id);
                                            }}
                                            disabled={isDeleting === photo.id}
                                            className="absolute top-2 right-2 rounded-md bg-red-600 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700 disabled:bg-gray-400"
                                            title="Delete photo"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="mt-4 rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">
                            {successMessage}
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Confirm Deletion
                        </h3>
                        <p className="mb-6 text-gray-600">
                            {deleteConfirmation.isInPool
                                ? "This image is currently in the rating pool. Deleting it will remove it from the pool and delete all associated data."
                                : "Deleting this image will permanently remove it and all associated data."}
                        </p>
                        <p className="mb-6 font-medium text-gray-700">
                            Are you sure you want to proceed?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
