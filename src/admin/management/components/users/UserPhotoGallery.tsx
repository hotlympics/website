import type { AdminImageData } from "../../../types/admin";
import { getImageUrl } from "../../../utils/formatters";

interface UserPhotoGalleryProps {
    imageData: AdminImageData[];
    poolImageIds: string[];
    onPhotoClick: (imageData: AdminImageData) => void;
    onDeletePhoto: (
        imageId: string,
        userId: string,
        event?: React.MouseEvent
    ) => void;
    deletingPhoto: string | null;
    userId: string;
}

const UserPhotoGallery = ({
    imageData,
    poolImageIds,
    onPhotoClick,
    onDeletePhoto,
    deletingPhoto,
    userId,
}: UserPhotoGalleryProps) => {
    if (imageData.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic">
                No photos uploaded
            </div>
        );
    }

    return (
        <div>
            <h4 className="mb-3 font-medium text-gray-900">Photos</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {imageData.map((imageItem) => {
                    const isInPool = poolImageIds.includes(imageItem.imageId);
                    const isDeleting = deletingPhoto === imageItem.imageId;

                    return (
                        <div
                            key={imageItem.id}
                            className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200 hover:scale-105 ${
                                isInPool
                                    ? "shadow-lg ring-4 ring-green-400"
                                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                            } ${isDeleting ? "opacity-50" : ""}`}
                            onClick={() =>
                                !isDeleting && onPhotoClick(imageItem)
                            }
                        >
                            <img
                                src={getImageUrl(imageItem.imageUrl)}
                                alt="User photo"
                                className="h-20 w-full object-cover"
                            />

                            {/* Delete button */}
                            <button
                                onClick={(e) =>
                                    onDeletePhoto(imageItem.imageId, userId, e)
                                }
                                disabled={isDeleting}
                                className={`absolute top-1 left-1 rounded-full p-1 transition-all duration-200 ${
                                    isDeleting
                                        ? "cursor-not-allowed bg-gray-400"
                                        : "bg-red-500 hover:bg-red-600 active:bg-red-700"
                                }`}
                                title={
                                    isDeleting ? "Deleting..." : "Delete photo"
                                }
                            >
                                {isDeleting ? (
                                    <svg
                                        className="h-3 w-3 animate-spin text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    <svg
                                        className="h-3 w-3 text-white"
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
                                )}
                            </button>

                            {isInPool && (
                                <div className="absolute top-1 right-1">
                                    <div className="rounded bg-green-500 px-1 py-0.5 text-xs text-white">
                                        Pool
                                    </div>
                                </div>
                            )}
                            <div className="bg-opacity-60 absolute right-0 bottom-0 left-0 bg-black p-1 text-xs text-white">
                                <div>ELO: {imageItem.eloScore}</div>
                                <div>{imageItem.battles} battles</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserPhotoGallery;
