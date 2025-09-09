import { Image, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ImageCropModal from "../components/shared/image-crop-modal";
import { useAuth } from "../hooks/auth/use-auth";
import { usePhotoUpload } from "../hooks/profile/use-photo-upload";
import { useProfile } from "../hooks/profile/use-profile";

const UploadPage = () => {
    const navigate = useNavigate();
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setShowCropModal(true);
        }
        // Reset input value to allow selecting the same file again
        event.target.value = "";
    };

    const handleCropComplete = async (croppedFile: File) => {
        setIsProcessing(true);
        try {
            await uploadPhoto(
                croppedFile,
                (message) => {
                    showSuccessMessage(message);
                    // Navigate to My Photos tab after successful upload
                    setTimeout(() => {
                        navigate("/my-photos");
                    }, 1500); // Small delay to show success message
                },
                (errorMessage) => {
                    console.error("Upload error:", errorMessage);
                }
            );
            setShowCropModal(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Error processing cropped image:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setSelectedFile(null);
    };

    const isAtLimit = uploadedPhotos.length >= 10;

    return (
        <div className="flex min-h-screen flex-col">
            {/* Title at top */}
            <div className="pt-8 pb-4">
                <h1 className="text-center text-lg font-medium text-gray-100">
                    Upload Photo
                </h1>
            </div>

            {/* Main content area - centered */}
            <div className="flex flex-1 flex-col items-center justify-center px-4">
                {/* Blue image icon with plus */}
                <div className="relative mb-6">
                    <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-blue-600">
                        <Image size={32} className="text-white" />
                    </div>
                    <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-blue-600">
                        <Plus size={16} className="text-white" />
                    </div>
                </div>

                {/* Main text */}
                <h2 className="mb-4 text-center text-xl font-medium text-white">
                    Upload Your Photo
                </h2>

                {/* Subtitle */}
                <p className="mb-8 text-center text-sm text-gray-400">
                    Select a photo from your library or take a new one
                </p>

                {/* Upload status */}
                {(isUploading || isProcessing) && (
                    <div className="mb-4 text-center">
                        <div className="mb-2 text-blue-500">
                            {isProcessing
                                ? "Processing..."
                                : uploadStatus || "Uploading..."}
                        </div>
                        {uploadProgress > 0 && (
                            <div className="h-2 w-64 rounded-full bg-gray-700">
                                <div
                                    className="h-2 rounded-full bg-blue-600 transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Choose Photo button at bottom */}
            <div className="flex justify-center px-4 pb-32">
                <button
                    onClick={handleChoosePhoto}
                    disabled={isUploading || isAtLimit || isProcessing}
                    className="flex w-[90%] items-center justify-center space-x-2 rounded-lg bg-blue-600 py-4 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Image size={20} className="text-white" />
                    <span>
                        {isUploading || isProcessing
                            ? "Processing..."
                            : isAtLimit
                              ? "Upload Limit Reached"
                              : "Choose Photo"}
                    </span>
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading || isAtLimit || isProcessing}
                className="hidden"
            />

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={showCropModal}
                onClose={handleCropCancel}
                onCropComplete={handleCropComplete}
                imageFile={selectedFile}
                isLoading={isProcessing}
            />
        </div>
    );
};

export default UploadPage;
