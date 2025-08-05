interface PhotoUploadProps {
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    const isAtLimit = uploadedPhotosCount >= maxPhotos;

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
                onChange={onFileSelect}
                disabled={isUploading || isAtLimit}
            />
            <label
                htmlFor="photo-upload"
                className={`block w-full cursor-pointer rounded-md px-4 py-2 text-center text-white ${
                    isUploading || isAtLimit
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {isUploading
                    ? uploadStatus || "Uploading..."
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
        </div>
    );
};

export default PhotoUpload;