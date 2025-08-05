interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    warningMessage?: string;
}

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    warningMessage,
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <p className="mb-6 text-gray-600">{message}</p>
                {warningMessage && (
                    <p className="mb-6 font-medium text-gray-700">
                        {warningMessage}
                    </p>
                )}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
