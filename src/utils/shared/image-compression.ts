import imageCompression from "browser-image-compression";

interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    fileType?: string;
}

export const compressImage = async (
    imageFile: File,
    options: CompressionOptions = {}
): Promise<File> => {
    const defaultOptions = {
        maxSizeMB: 1, // 1MB max size
        maxWidthOrHeight: 1920, // Full HD max dimension
        useWebWorker: true,
        maxIteration: 10,
        fileType: imageFile.type,
    };

    const compressionOptions = { ...defaultOptions, ...options };

    // Check if WebP is supported and user uploaded JPEG/PNG
    const supportsWebP = await checkWebPSupport();
    if (
        supportsWebP &&
        (imageFile.type === "image/jpeg" || imageFile.type === "image/png")
    ) {
        compressionOptions.fileType = "image/webp";
    }

    try {
        const compressedFile = await imageCompression(
            imageFile,
            compressionOptions
        );

        // Log compression results
        console.log("Original file:", {
            name: imageFile.name,
            size: formatFileSize(imageFile.size),
            type: imageFile.type,
        });
        console.log("Compressed file:", {
            name: compressedFile.name,
            size: formatFileSize(compressedFile.size),
            type: compressedFile.type,
        });
        console.log(
            `Compression ratio: ${(
                ((imageFile.size - compressedFile.size) / imageFile.size) *
                100
            ).toFixed(1)}%`
        );

        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        // Return original file if compression fails
        return imageFile;
    }
};

const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
        };
        webP.src =
            "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validation function to check if file is an image
export const validateImageFile = (
    file: File
): { valid: boolean; error?: string } => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
        };
    }

    // Check file size (10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: "File size must be less than 10MB",
        };
    }

    return { valid: true };
};
