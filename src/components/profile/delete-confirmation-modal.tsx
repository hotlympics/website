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
            <div className="mx-4 w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-100">
                    {title}
                </h3>
                <p className="mb-6 text-gray-400">{message}</p>
                {warningMessage && (
                    <p className="mb-6 font-medium text-gray-300">
                        {warningMessage}
                    </p>
                )}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 hover:bg-gray-700"
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
