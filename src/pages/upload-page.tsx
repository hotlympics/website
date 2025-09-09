import { useEffect, useState, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Image, Plus } from "lucide-react";
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
                {(isUploading || isProcessing) && (
                    <div className="text-center mb-4">
                        <div className="text-blue-500 mb-2">
                            {isProcessing ? "Processing..." : uploadStatus || "Uploading..."}
                        </div>
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
                    disabled={isUploading || isAtLimit || isProcessing}
                    className="w-[90%] py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    <Image size={20} className="text-white" />
                    <span>
                        {isUploading || isProcessing 
                            ? "Processing..." 
                            : isAtLimit 
                                ? "Upload Limit Reached" 
                                : "Choose Photo"
                        }
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