import React, { useState } from "react";
import ImageCropModal from "../shared/image-crop-modal";

interface PhotoUploadProps {
    onFileSelect: (croppedFile: File) => void;
    isUploading: boolean;
    uploadStatus: string;
    uploadProgress: number;
    uploadedPhotosCount: number;
    maxPhotos?: number;
}

const PhotoUpload = ({
    onFileSelect,
    isUploading,
    uploadStatus,
    uploadProgress,
    uploadedPhotosCount,
    maxPhotos = 10,
}: PhotoUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const isAtLimit = uploadedPhotosCount >= maxPhotos;

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
            onFileSelect(croppedFile);
            setShowCropModal(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Error processing cropped image:", error);
            alert("Failed to process image. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setSelectedFile(null);
    };

    return (
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
                disabled={isUploading || isAtLimit || isProcessing}
            />
            <label
                htmlFor="photo-upload"
                className={`block w-full cursor-pointer rounded-md px-4 py-2 text-center text-white ${
                    isUploading || isAtLimit || isProcessing
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {isUploading
                    ? uploadStatus || "Uploading..."
                    : isProcessing
                      ? "Processing..."
                      : isAtLimit
                        ? "Upload Limit Reached"
                        : "Choose Photo"}
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

export default PhotoUpload;
