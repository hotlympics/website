import { formatDate, getImageUrl } from "../../../utils/admin/formatters";
import type {
    PhotoModalData,
    UserDetails,
} from "../../../utils/types/admin/admin";

interface PhotoModalProps {
    photoModal: PhotoModalData | null;
    onClose: () => void;
    onTogglePool: (
        imageId: string,
        userId: string,
        currentlyInPool: boolean
    ) => void;
    onDeletePhoto: (imageId: string, userId: string) => void;
    togglingPool: string | null;
    deletingPhoto: string | null;
    userDetails: Record<string, UserDetails>;
}

const PhotoModal = ({
    photoModal,
    onClose,
    onTogglePool,
    onDeletePhoto,
    togglingPool,
    deletingPhoto,
    userDetails,
}: PhotoModalProps) => {
    if (!photoModal) return null;

    const handleTogglePool = () => {
        const userId = Object.keys(userDetails).find((uid) =>
            userDetails[uid].imageData.some(
                (img) => img.imageId === photoModal.imageData.imageId
            )
        );
        if (userId) {
            onTogglePool(
                photoModal.imageData.imageId,
                userId,
                photoModal.isInPool
            );
        }
    };

    const handleDeletePhoto = () => {
        const userId = Object.keys(userDetails).find((uid) =>
            userDetails[uid].imageData.some(
                (img) => img.imageId === photoModal.imageData.imageId
            )
        );
        if (userId) {
            onDeletePhoto(photoModal.imageData.imageId, userId);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-medium">Photo Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
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
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Photo */}
                        <div className="space-y-4">
                            <div
                                className={`relative overflow-hidden rounded-lg ${
                                    photoModal.isInPool
                                        ? "ring-4 ring-green-400"
                                        : "ring-1 ring-gray-300"
                                }`}
                            >
                                <img
                                    src={getImageUrl(
                                        photoModal.imageData.imageUrl
                                    )}
                                    alt="Photo detail"
                                    className="h-96 w-full object-cover"
                                />
                                {photoModal.isInPool && (
                                    <div className="absolute top-4 right-4">
                                        <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                                            In Pool
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleTogglePool}
                                    disabled={
                                        togglingPool ===
                                        photoModal.imageData.imageId
                                    }
                                    className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                                        togglingPool ===
                                        photoModal.imageData.imageId
                                            ? "cursor-not-allowed bg-gray-400 text-white"
                                            : photoModal.isInPool
                                              ? "bg-orange-600 text-white hover:bg-orange-700"
                                              : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {togglingPool ===
                                    photoModal.imageData.imageId
                                        ? "Updating..."
                                        : photoModal.isInPool
                                          ? "Remove from Pool"
                                          : "Add to Pool"}
                                </button>
                                <button
                                    onClick={handleDeletePhoto}
                                    disabled={
                                        deletingPhoto ===
                                        photoModal.imageData.imageId
                                    }
                                    className={`flex-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                                        deletingPhoto ===
                                        photoModal.imageData.imageId
                                            ? "cursor-not-allowed bg-gray-400 text-white"
                                            : "bg-red-600 text-white hover:bg-red-700"
                                    }`}
                                >
                                    {deletingPhoto ===
                                    photoModal.imageData.imageId
                                        ? "Deleting..."
                                        : "Delete Photo"}
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3 text-lg font-medium text-gray-900">
                                    Battle Statistics
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {photoModal.imageData.battles}
                                        </div>
                                        <div className="text-sm text-blue-800">
                                            Total Battles
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="text-2xl font-bold text-green-600">
                                            {photoModal.imageData.wins}
                                        </div>
                                        <div className="text-sm text-green-800">
                                            Wins
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-red-50 p-4">
                                        <div className="text-2xl font-bold text-red-600">
                                            {photoModal.imageData.losses}
                                        </div>
                                        <div className="text-sm text-red-800">
                                            Losses
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-yellow-50 p-4">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {photoModal.imageData.draws}
                                        </div>
                                        <div className="text-sm text-yellow-800">
                                            Draws
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 text-lg font-medium text-gray-900">
                                    ELO Rating
                                </h4>
                                <div className="rounded-lg bg-purple-50 p-4">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {photoModal.imageData.eloScore}
                                    </div>
                                    <div className="text-sm text-purple-800">
                                        Current Rating
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 text-lg font-medium text-gray-900">
                                    Photo Information
                                </h4>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Image ID:
                                        </dt>
                                        <dd className="font-mono text-sm text-gray-900">
                                            {photoModal.imageData.imageId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Gender:
                                        </dt>
                                        <dd className="text-sm text-gray-900 capitalize">
                                            {photoModal.imageData.gender}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Date of Birth:
                                        </dt>
                                        <dd className="text-sm text-gray-900">
                                            {formatDate(
                                                photoModal.imageData.dateOfBirth
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Win Rate:
                                        </dt>
                                        <dd className="text-sm text-gray-900">
                                            {photoModal.imageData.battles > 0
                                                ? `${((photoModal.imageData.wins / photoModal.imageData.battles) * 100).toFixed(1)}%`
                                                : "No battles yet"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;
