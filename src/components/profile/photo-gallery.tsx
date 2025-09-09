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
}

const PhotoGallery = ({
    photos,
    poolSelections,
    onPoolToggle,
    onDeletePhoto,
    deletingPhoto,
}: PhotoGalleryProps) => {
    if (photos.length === 0) {
        return (
            <div className="rounded-lg bg-black p-6 shadow-md">
                <p className="text-center text-gray-400">
                    No photos uploaded yet
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto rounded-lg bg-black shadow-md">
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {photos.map((photo) => {
                        const isInPool = poolSelections.has(photo.id);
                        return (
                            <div
                                key={photo.id}
                                className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-700 ${
                                    deletingPhoto === photo.id
                                        ? "opacity-50"
                                        : ""
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
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-white"></div>
                                    </div>
                                )}

                                {/* Always visible delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeletePhoto(photo.id);
                                    }}
                                    disabled={deletingPhoto === photo.id}
                                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-colors hover:bg-red-700 disabled:bg-gray-600"
                                    title="Delete photo"
                                >
                                    <svg
                                        className="h-3 w-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PhotoGallery;
