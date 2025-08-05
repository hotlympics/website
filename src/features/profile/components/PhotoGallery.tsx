interface UploadedPhoto {
    id: string;
    url: string;
    uploadedAt: string;
    inPool?: boolean;
}

interface PhotoGalleryProps {
    photos: UploadedPhoto[];
    poolSelections: Set<string>;
    onPoolToggle: (photoId: string) => void;
    onDeletePhoto: (photoId: string) => void;
    deletingPhoto: string | null;
    maxPhotos?: number;
}

const PhotoGallery = ({
    photos,
    poolSelections,
    onPoolToggle,
    onDeletePhoto,
    deletingPhoto,
    maxPhotos = 10,
}: PhotoGalleryProps) => {
    if (photos.length === 0) {
        return (
            <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Uploaded Photos
                    </h2>
                    <span className="text-sm text-gray-500">
                        {photos.length}/{maxPhotos} photos
                    </span>
                </div>
                <p className="text-center text-gray-500">No photos uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-700">
                    Uploaded Photos
                </h2>
                <span className="text-sm text-gray-500">
                    {photos.length}/{maxPhotos} photos
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {photos.map((photo) => {
                    const isInPool = poolSelections.has(photo.id);
                    return (
                        <div
                            key={photo.id}
                            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 ${
                                deletingPhoto === photo.id ? "opacity-50" : ""
                            } ${isInPool ? "ring-4 ring-green-500" : ""}`}
                            onClick={() => onPoolToggle(photo.id)}
                        >
                            <img
                                src={photo.url}
                                alt="Uploaded photo"
                                className="h-full w-full object-cover"
                                onError={() => {
                                    console.log(
                                        `Failed to load image ${photo.id}. Removing from list.`
                                    );
                                }}
                            />

                            {/* Pool indicator */}
                            {isInPool && (
                                <div className="absolute top-2 left-2 rounded-full bg-green-500 p-2 text-white">
                                    <svg
                                        className="h-4 w-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}

                            {deletingPhoto === photo.id && (
                                <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white"></div>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePhoto(photo.id);
                                }}
                                disabled={deletingPhoto === photo.id}
                                className="absolute top-2 right-2 rounded-md bg-red-600 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700 disabled:bg-gray-400"
                                title="Delete photo"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PhotoGallery;