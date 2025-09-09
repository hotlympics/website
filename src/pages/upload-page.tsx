import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import PhotoUpload from "../components/profile/photo-upload";
import { useAuth } from "../hooks/auth/use-auth";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { useProfile } from "../hooks/profile/use-profile";

const UploadPage = () => {
    const { user, loading: authLoading } = useAuth();
    const {
        uploadedPhotos,
        isUploading,
        uploadStatus,
        uploadProgress,
        fetchUploadedPhotos,
        uploadPhoto,
    } = usePhotoUpload();
    const { showSuccessMessage } = useProfile();

    useEffect(() => {
        if (user) {
            fetchUploadedPhotos();
        }
    }, [user, fetchUploadedPhotos]);

    // Redirect to sign in if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/signin?redirect=/upload" replace />;
    }

    // Loading state
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-600"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    const handleFileSelect = async (croppedFile: File) => {
        await uploadPhoto(
            croppedFile,
            (message) => showSuccessMessage(message),
            (errorMessage) => {
                console.error("Upload error:", errorMessage);
            }
        );
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">
                        Upload Photo
                    </h1>
                    <p className="text-gray-400">
                        Upload a new photo to join the rating pool
                    </p>
                </div>

                <div className="max-w-md">
                    <PhotoUpload
                        onFileSelect={handleFileSelect}
                        isUploading={isUploading}
                        uploadStatus={uploadStatus}
                        uploadProgress={uploadProgress}
                        uploadedPhotosCount={uploadedPhotos.length}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadPage;