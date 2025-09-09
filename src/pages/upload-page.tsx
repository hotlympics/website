import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Image, Plus } from "lucide-react";
import { useAuth } from "../hooks/auth/use-auth";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { useProfile } from "../hooks/profile/use-profile";

const UploadPage = () => {
    const { user, loading: authLoading } = useAuth();
    const {
        isUploading,
        uploadStatus,
        uploadProgress,
        fetchUploadedPhotos,
        uploadPhoto,
    } = usePhotoUpload();
    const { showSuccessMessage } = useProfile();
    const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

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

    const handleChoosePhoto = () => {
        fileInputRef?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        await uploadPhoto(
            file,
            (message) => showSuccessMessage(message),
            (errorMessage) => {
                console.error("Upload error:", errorMessage);
            }
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Title at top */}
            <div className="pt-8 pb-4">
                <h1 className="text-center text-lg font-medium text-gray-100">
                    Upload Photo
                </h1>
            </div>

            {/* Main content area - centered */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* Blue image icon with plus */}
                <div className="relative mb-6">
                    <div className="w-20 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Image size={32} className="text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-black">
                        <Plus size={16} className="text-white" />
                    </div>
                </div>

                {/* Main text */}
                <h2 className="text-xl text-white font-medium mb-4 text-center">
                    Upload Your Photo
                </h2>

                {/* Subtitle */}
                <p className="text-gray-400 text-center text-sm mb-8">
                    Select a photo from your library or take a new one
                </p>

                {/* Upload status */}
                {isUploading && (
                    <div className="text-center mb-4">
                        <div className="text-blue-500 mb-2">{uploadStatus}</div>
                        {uploadProgress > 0 && (
                            <div className="w-64 bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Choose Photo button at bottom */}
            <div className="px-4 pb-32 flex justify-center">
                <button
                    onClick={handleChoosePhoto}
                    disabled={isUploading}
                    className="w-[90%] py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                    <Image size={20} className="text-white" />
                    <span>Choose Photo</span>
                </button>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={setFileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default UploadPage;