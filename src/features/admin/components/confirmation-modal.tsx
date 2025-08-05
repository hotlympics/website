import type { ConfirmationModalProps } from "../types/common";

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    type = "danger",
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    const typeStyles = {
        danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        warning: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
        info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    };

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
                    {title}
                </h3>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-md px-4 py-2 font-medium text-white transition-colors ${
                            isLoading
                                ? "cursor-not-allowed bg-gray-400"
                                : typeStyles[type]
                        }`}
                    >
                        {isLoading ? "Loading..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
