import { useState } from "react";
import {
    compressImage,
    validateImageFile,
} from "../../../utils/shared/image-compression";
import type { CreateUserData } from "../../../utils/types/admin/admin";

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

    if (!isOpen) return null;

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        setImageUploadStatus("Validating and compressing images...");

        try {
            for (const file of newFiles) {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    errors.push(`${file.name}: ${validation.error}`);
                    continue;
                }

                try {
                    const compressedFile = await compressImage(file, {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1280,
                        useWebWorker: true,
                    });

                    validFiles.push(compressedFile);
                } catch (compressionError) {
                    console.error(
                        `Failed to compress ${file.name}:`,
                        compressionError
                    );
                    errors.push(`${file.name}: Failed to compress image`);
                }
            }

            if (errors.length > 0) {
                alert(
                    `Some files could not be processed:\n${errors.join("\n")}`
                );
            }

            if (validFiles.length > 0) {
                setCreateUserForm((prev) => ({
                    ...prev,
                    images: [...prev.images, ...validFiles],
                }));
            }
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to process images. Please try again.");
        } finally {
            setImageUploadStatus("");
            event.target.value = "";
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
                            Upload Images
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="images"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Add Photos (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={!!imageUploadStatus}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Select multiple images to upload for this
                                    user. Images will be automatically
                                    compressed to WebP format.
                                </p>
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
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Selected Images (
                                        {createUserForm.images.length})
                                        {createUserForm.poolImageIndices.size >
                                            0 && (
                                            <span className="ml-2 text-blue-600">
                                                •{" "}
                                                {
                                                    createUserForm
                                                        .poolImageIndices.size
                                                }{" "}
                                                will be added to pool
                                            </span>
                                        )}
                                    </p>
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
            </div>
        </div>
    );
};

export default CreateUserModal;
