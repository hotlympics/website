import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { compressImage, validateImageFile } from "../utils/image-compression";

interface UploadedPhoto {
    id: string;
    url: string;
    uploadedAt: string;
}

const AccountPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            navigate("/signin?redirect=/account");
            return;
        }

        const userInfo = localStorage.getItem("user_info");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }

        fetchUploadedPhotos();
    }, [navigate]);

    const fetchUploadedPhotos = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const photos = await response.json();
                const baseUrl =
                    import.meta.env.VITE_API_URL || "http://localhost:3000";
                // Convert relative URLs to absolute URLs
                const photosWithAbsoluteUrls = photos.map(
                    (photo: UploadedPhoto) => ({
                        ...photo,
                        url: photo.url.startsWith("http")
                            ? photo.url
                            : `${baseUrl}${photo.url}`,
                    })
                );

                setUploadedPhotos(photosWithAbsoluteUrls);
            }
        } catch (err) {
            console.error("Failed to fetch photos:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
        navigate("/signin");
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
        setUploadStatus("Compressing image...");

        try {
            // Compress the image
            const compressedFile = await compressImage(file, {
                maxSizeMB: 0.5, // Compress to max 500KB
                maxWidthOrHeight: 1280, // Max dimension 1280px
                useWebWorker: true,
            });

            setUploadStatus("Uploading...");
            const formData = new FormData();
            formData.append("image", compressedFile);

            const token = localStorage.getItem("auth_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Upload failed");
            }

            const result = await response.json();
            // Create photo object from server response
            const baseUrl =
                import.meta.env.VITE_API_URL || "http://localhost:3000";
            const uploadedPhoto = {
                id: result.imageId,
                url: `${baseUrl}${result.imageUrl}`,
                uploadedAt: new Date().toISOString(),
            };

            setUploadedPhotos([uploadedPhoto, ...uploadedPhotos]);

            // Reset file input
            event.target.value = "";
        } catch (error) {
            setError(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
            setUploadStatus("");
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        // Optimistic update - immediately remove from UI
        const previousPhotos = [...uploadedPhotos];

        setUploadedPhotos(
            uploadedPhotos.filter((photo) => photo.id !== photoId)
        );
        setIsDeleting(photoId);
        setError(null);

        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/${photoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
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

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

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
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

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
                    {uploadedPhotos.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No photos uploaded yet
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {uploadedPhotos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className={`group relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                                        isDeleting === photo.id
                                            ? "opacity-50"
                                            : ""
                                    }`}
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
                                    {isDeleting === photo.id && (
                                        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white"></div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() =>
                                            handleDeletePhoto(photo.id)
                                        }
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
