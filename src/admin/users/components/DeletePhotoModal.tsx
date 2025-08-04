interface DeleteConfirmation {
    imageId: string;
    userId: string;
    isInPool: boolean;
}

interface DeletePhotoModalProps {
    deleteConfirmation: DeleteConfirmation | null;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

const DeletePhotoModal = ({
    deleteConfirmation,
    onClose,
    onConfirm,
    isDeleting,
}: DeletePhotoModalProps) => {
    if (!deleteConfirmation) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Confirm Photo Deletion
                </h3>
                <p className="mb-4 text-gray-600">
                    {deleteConfirmation.isInPool
                        ? "This image is currently in the rating pool. Deleting it will remove it from the pool and permanently delete:"
                        : "Deleting this image will permanently remove:"}
                </p>
                <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-gray-600">
                    <li>The image from cloud storage</li>
                    <li>All battle data for this image</li>
                    <li>All associated metadata</li>
                    {deleteConfirmation.isInPool && (
                        <li className="font-medium text-orange-600">
                            Its placement in the rating pool
                        </li>
                    )}
                </ul>
                <p className="mb-6 font-medium text-gray-700">
                    This action cannot be undone. Are you sure you want to
                    proceed?
                </p>
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={`flex-1 rounded-md px-4 py-2 font-medium text-white transition-colors ${
                            isDeleting
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {isDeleting ? "Deleting..." : "Delete Photo"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePhotoModal;
