import "cropperjs/dist/cropper.css";
import React, { useCallback, useRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (croppedFile: File) => void;
    imageFile: File | null;
    isLoading?: boolean;
}

const ImageCropModal = ({
    isOpen,
    onClose,
    onCropComplete,
    imageFile,
    isLoading = false,
}: ImageCropModalProps) => {
    const cropperRef = useRef<ReactCropperElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Create image URL when file changes
    React.useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImageUrl(null);
        }
    }, [imageFile]);

    const createCroppedImage = useCallback(async () => {
        if (!cropperRef.current || !imageFile) return;

        try {
            const cropper = cropperRef.current.cropper;
            const canvas = cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "high",
            });

            return new Promise<File>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to create blob"));
                            return;
                        }

                        const fileName =
                            imageFile.name.replace(/\.[^/.]+$/, "") +
                            "_cropped.jpg";
                        const file = new File([blob], fileName, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(file);
                    },
                    "image/jpeg",
                    0.9
                );
            });
        } catch (error) {
            console.error("Error creating cropped image:", error);
            throw error;
        }
    }, [imageFile]);

    const handleSaveCrop = async () => {
        try {
            const croppedFile = await createCroppedImage();
            if (croppedFile) {
                onCropComplete(croppedFile);
            }
        } catch (error) {
            console.error("Failed to crop image:", error);
            alert("Failed to crop image. Please try again.");
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !imageFile || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="mx-4 max-h-[90vh] w-auto max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Upload Image
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Crop Area */}
                <div className="relative h-96 w-96 bg-gray-100">
                    <Cropper
                        ref={cropperRef}
                        src={imageUrl}
                        style={{ height: "100%", width: "100%" }}
                        aspectRatio={1}
                        guides={true}
                        background={false}
                        responsive={true}
                        autoCropArea={0.8}
                        checkOrientation={false}
                        cropBoxMovable={true}
                        cropBoxResizable={true}
                        dragMode="crop"
                        movable={false}
                        viewMode={1}
                        minCropBoxHeight={50}
                        minCropBoxWidth={50}
                    />
                </div>

                {/* Controls */}
                <div className="border-t p-4">
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveCrop}
                            disabled={isLoading}
                            className={`rounded-md px-6 py-2 font-medium text-white transition-colors ${
                                isLoading
                                    ? "cursor-not-allowed bg-gray-400"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isLoading ? "Processing..." : "Save Image"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
