import { useState } from "react";
import {
    compressImage,
    validateImageFile,
} from "../../../utils/shared/image-compression";
import type { CreateUserData } from "../../../utils/types/admin/admin";
import ImageCropModal from "../../shared/image-crop-modal";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateUser: (userData: CreateUserData) => void;
    isLoading: boolean;
}

const CreateUserModal = ({
    isOpen,
    onClose,
    onCreateUser,
    isLoading,
}: CreateUserModalProps) => {
    const [createUserForm, setCreateUserForm] = useState({
        email: "",
        displayName: "",
        gender: "",
        dateOfBirth: "",
        images: [] as File[],
        poolImageIndices: new Set<number>(),
    });
    const [imageUploadStatus, setImageUploadStatus] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

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
            await processAndAddImage(croppedFile);
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

    const processAndAddImage = async (file: File) => {
        setImageUploadStatus("Validating and compressing image...");

        try {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                alert(`${file.name}: ${validation.error}`);
                return;
            }

            const compressedFile = await compressImage(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            });

            setCreateUserForm((prev) => ({
                ...prev,
                images: [...prev.images, compressedFile],
            }));
        } catch (error) {
            console.error("Image processing error:", error);
            alert("Failed to process image. Please try again.");
        } finally {
            setImageUploadStatus("");
        }
    };

    const removeImage = (index: number) => {
        setCreateUserForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            poolImageIndices: new Set(
                [...prev.poolImageIndices]
                    .filter((i) => i !== index)
                    .map((i) => (i > index ? i - 1 : i))
            ),
        }));
    };

    const togglePoolImage = (index: number) => {
        setCreateUserForm((prev) => {
            const newPoolIndices = new Set(prev.poolImageIndices);
            if (newPoolIndices.has(index)) {
                newPoolIndices.delete(index);
            } else {
                newPoolIndices.add(index);
            }
            return {
                ...prev,
                poolImageIndices: newPoolIndices,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const userData: CreateUserData = {
            email: createUserForm.email,
            displayName: createUserForm.displayName || null,
            gender: createUserForm.gender as "male" | "female",
            dateOfBirth: createUserForm.dateOfBirth,
            images: createUserForm.images,
            poolImageIndices: Array.from(createUserForm.poolImageIndices),
        };

        onCreateUser(userData);
    };

    const resetForm = () => {
        setCreateUserForm({
            email: "",
            displayName: "",
            gender: "",
            dateOfBirth: "",
            images: [],
            poolImageIndices: new Set<number>(),
        });
        setImageUploadStatus("");
        setSelectedFile(null);
        setShowCropModal(false);
        setIsProcessing(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-6 text-xl font-semibold text-gray-900">
                    Create New User
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Required Fields */}
                    <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-3 font-medium text-blue-900">
                            Required Information
                        </h4>

                        {/* Email */}
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={createUserForm.email}
                                onChange={(e) =>
                                    setCreateUserForm((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                placeholder="user@example.com"
                            />
                        </div>

                        {/* Gender */}
                        <div className="mb-4">
                            <label
                                htmlFor="gender"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Gender *
                            </label>
                            <select
                                id="gender"
                                required
                                value={createUserForm.gender}
                                onChange={(e) =>
                                    setCreateUserForm((prev) => ({
                                        ...prev,
                                        gender: e.target.value,
                                    }))
                                }
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label
                                htmlFor="dateOfBirth"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Date of Birth *{" "}
                                <span className="text-sm text-gray-500">
                                    (Must be 18+)
                                </span>
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                required
                                value={createUserForm.dateOfBirth}
                                onChange={(e) =>
                                    setCreateUserForm((prev) => ({
                                        ...prev,
                                        dateOfBirth: e.target.value,
                                    }))
                                }
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                max={
                                    new Date(
                                        new Date().setFullYear(
                                            new Date().getFullYear() - 18
                                        )
                                    )
                                        .toISOString()
                                        .split("T")[0]
                                }
                            />
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-3 font-medium text-gray-900">
                            Optional Information
                        </h4>

                        {/* Display Name */}
                        <div>
                            <label
                                htmlFor="displayName"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={createUserForm.displayName}
                                onChange={(e) =>
                                    setCreateUserForm((prev) => ({
                                        ...prev,
                                        displayName: e.target.value,
                                    }))
                                }
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <h4 className="mb-3 font-medium text-green-900">
                            Upload Photos (Optional)
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-upload"
                                    onChange={handleFileSelect}
                                    disabled={
                                        isProcessing || !!imageUploadStatus
                                    }
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`inline-block w-1/2 cursor-pointer rounded-md px-4 py-2 text-center text-white ${
                                        isProcessing || !!imageUploadStatus
                                            ? "cursor-not-allowed bg-gray-400"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {isProcessing
                                        ? "Processing..."
                                        : imageUploadStatus
                                          ? imageUploadStatus
                                          : "Choose Photo"}
                                </label>
                                {imageUploadStatus && (
                                    <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                        <span>{imageUploadStatus}</span>
                                    </div>
                                )}
                            </div>

                            {/* Image Previews */}
                            {createUserForm.images.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {createUserForm.images.map(
                                            (image, index) => {
                                                const isInPool =
                                                    createUserForm.poolImageIndices.has(
                                                        index
                                                    );
                                                return (
                                                    <div
                                                        key={index}
                                                        className="group relative"
                                                    >
                                                        <div
                                                            className={`relative rounded-md border-2 transition-colors ${
                                                                isInPool
                                                                    ? "border-blue-500 bg-blue-50"
                                                                    : "border-gray-200"
                                                            }`}
                                                        >
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    image
                                                                )}
                                                                alt={`Preview ${index + 1}`}
                                                                className="h-24 w-full rounded-md object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeImage(
                                                                        index
                                                                    )
                                                                }
                                                                className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                                            >
                                                                ×
                                                            </button>
                                                            {isInPool && (
                                                                <div className="absolute top-1 left-1 rounded bg-blue-500 px-1 py-0.5 text-xs text-white">
                                                                    Pool
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="truncate text-xs text-gray-500">
                                                                {image.name}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    togglePoolImage(
                                                                        index
                                                                    )
                                                                }
                                                                className={`w-full rounded px-2 py-1 text-xs transition-colors ${
                                                                    isInPool
                                                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                }`}
                                                            >
                                                                {isInPool
                                                                    ? "Remove from Pool"
                                                                    : "Add to Pool"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isLoading ||
                                !createUserForm.email ||
                                !createUserForm.gender ||
                                !createUserForm.dateOfBirth
                            }
                            className={`flex-1 rounded-md px-4 py-2 font-medium text-white transition-colors ${
                                isLoading ||
                                !createUserForm.email ||
                                !createUserForm.gender ||
                                !createUserForm.dateOfBirth
                                    ? "cursor-not-allowed bg-gray-400"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {isLoading ? "Creating User..." : "Create User"}
                        </button>
                    </div>
                </form>

                <ImageCropModal
                    isOpen={showCropModal}
                    onClose={handleCropCancel}
                    onCropComplete={handleCropComplete}
                    imageFile={selectedFile}
                    isLoading={isProcessing}
                />
            </div>
        </div>
    );
};

export default CreateUserModal;
