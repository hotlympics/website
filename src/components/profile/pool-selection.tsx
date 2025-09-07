interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    poolImageIds?: string[];
}

interface PoolSelectionProps {
    poolSelections: Set<string>;
    user: UserInfo | null;
    isUpdating: boolean;
    onUpdatePool: () => void;
}

const PoolSelection = ({
    poolSelections,
    user,
    isUpdating,
    onUpdatePool,
}: PoolSelectionProps) => {
    const hasChanges =
        poolSelections.size !== (user?.poolImageIds?.length || 0) ||
        !Array.from(poolSelections).every((id) =>
            user?.poolImageIds?.includes(id)
        );

    return (
        <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
                Select up to 2 photos for the rating pool ({poolSelections.size}
                /2 selected)
            </p>
            <button
                onClick={onUpdatePool}
                disabled={isUpdating || !hasChanges}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                    isUpdating || !hasChanges
                        ? "cursor-not-allowed bg-gray-600"
                        : "bg-green-600 hover:bg-green-700"
                }`}
            >
                {isUpdating ? "Updating..." : "Save Pool Selection"}
            </button>
        </div>
    );
};

export default PoolSelection;
