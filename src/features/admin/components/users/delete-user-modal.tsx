interface UserDeleteConfirmation {
    userId: string;
    userEmail: string;
    step: "confirm" | "final";
}

interface DeleteUserModalProps {
    userDeleteConfirmation: UserDeleteConfirmation | null;
    onClose: () => void;
    onProceedToFinal: () => void;
    onBackToConfirm: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

const DeleteUserModal = ({
    userDeleteConfirmation,
    onClose,
    onProceedToFinal,
    onBackToConfirm,
    onConfirm,
    isDeleting,
}: DeleteUserModalProps) => {
    if (!userDeleteConfirmation) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {userDeleteConfirmation.step === "confirm" ? (
                    <>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Confirm User Deletion
                        </h3>
                        <p className="mb-4 text-gray-600">
                            Are you sure you want to delete user{" "}
                            <span className="font-medium text-gray-900">
                                "{userDeleteConfirmation.userEmail}"
                            </span>
                            ?
                        </p>
                        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="mb-2 text-sm font-medium text-red-800">
                                This will permanently delete:
                            </p>
                            <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
                                <li>User account and authentication</li>
                                <li>All user data from Firestore</li>
                                <li>All uploaded images from storage</li>
                                <li>All associated image data</li>
                            </ul>
                        </div>
                        <p className="mb-6 font-medium text-gray-700">
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onProceedToFinal}
                                className="flex-1 rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
                            >
                                Continue
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Final Confirmation
                        </h3>
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">
                                This is your final confirmation. You are about
                                to permanently delete:
                            </p>
                            <p className="mt-2 text-lg font-bold text-red-900">
                                {userDeleteConfirmation.userEmail}
                            </p>
                        </div>
                        <p className="mb-6 font-medium text-red-600">
                            This action is irreversible and will completely
                            remove all data associated with this user.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={onBackToConfirm}
                                disabled={isDeleting}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Back
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
                                {isDeleting
                                    ? "Deleting User..."
                                    : "Delete User"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeleteUserModal;
