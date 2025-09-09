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
        <div className="rounded-lg bg-gray-800 p-4">
            <div className="flex items-center justify-between gap-4">
                <p className="flex-1 text-sm text-gray-400">
                    Select up to 2 photos for the rating pool ({poolSelections.size}
                    /2 selected)
                </p>
                <button
                    onClick={onUpdatePool}
                    disabled={isUpdating || !hasChanges}
                    className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white ${
                        isUpdating || !hasChanges
                            ? "cursor-not-allowed bg-gray-600"
                            : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {isUpdating ? "Updating..." : "Save Pool Selection"}
                </button>
            </div>
        </div>
    );
};

export default PoolSelection;
