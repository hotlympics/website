import { useState } from "react";

export type ReportCategory =
    | "NOT_PERSON"
    | "IMPERSONATION"
    | "NUDITY"
    | "VIOLENCE"
    | "SPAM"
    | "INAPPROPRIATE"
    | "OTHER";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (category: ReportCategory, description?: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

const reportCategories = [
    { value: "NOT_PERSON" as const, label: "Not a person" },
    { value: "IMPERSONATION" as const, label: "Impersonation" },
    { value: "NUDITY" as const, label: "Nudity/Sexual content" },
    { value: "VIOLENCE" as const, label: "Violence" },
    { value: "SPAM" as const, label: "Spam" },
    { value: "INAPPROPRIATE" as const, label: "Inappropriate" },
    { value: "OTHER" as const, label: "Other" },
];

const ReportModal = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    error = null,
}: ReportModalProps) => {
    const [selectedCategory, setSelectedCategory] =
        useState<ReportCategory | null>(null);
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!selectedCategory) return;

        onSubmit(
            selectedCategory,
            selectedCategory === "OTHER" ? description : undefined
        );

        // Reset form
        setSelectedCategory(null);
        setDescription("");
    };

    const handleClose = () => {
        setSelectedCategory(null);
        setDescription("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Report Image
                    </h3>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                    Please select the reason for reporting this image:
                </p>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <div className="mb-4 space-y-2">
                    {reportCategories.map((category) => (
                        <label
                            key={category.value}
                            className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-colors ${
                                selectedCategory === category.value
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="reportCategory"
                                value={category.value}
                                checked={selectedCategory === category.value}
                                onChange={(e) =>
                                    setSelectedCategory(
                                        e.target.value as ReportCategory
                                    )
                                }
                                className="mt-0.5 h-4 w-4 text-blue-600"
                                disabled={isLoading}
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {category.label}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {selectedCategory === "OTHER" && (
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Please describe the issue:
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what's wrong with this image..."
                            disabled={isLoading}
                            maxLength={280}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
                            rows={3}
                        />
                        <div className="mt-1 text-right text-xs text-gray-500">
                            {description.length}/280 characters
                        </div>
                    </div>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={
                            isLoading ||
                            !selectedCategory ||
                            (selectedCategory === "OTHER" &&
                                !description.trim())
                        }
                        className={`flex-1 rounded-md px-4 py-2 font-medium text-white transition-colors ${
                            isLoading ||
                            !selectedCategory ||
                            (selectedCategory === "OTHER" &&
                                !description.trim())
                                ? "cursor-not-allowed bg-gray-400"
                                : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        }`}
                    >
                        {isLoading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
