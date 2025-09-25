interface UserInfo {
    email: string;
    gender?: "unknown" | "male" | "female";
    dateOfBirth?: string | null;
    poolImageIds?: string[];
}

interface DemoPoolSelectionProps {
    poolSelections: Set<string>;
    user: UserInfo | null;
}

const DemoPoolSelection = ({ poolSelections }: DemoPoolSelectionProps) => {
    return (
        <div className="rounded-lg bg-gray-800 p-4">
            <div className="flex items-center justify-between gap-4">
                <p className="flex-1 text-sm text-gray-400">
                    Select up to 2 photos for the rating pool (
                    {poolSelections.size}
                    /2 selected)
                </p>
                <button
                    disabled={true}
                    className="flex-shrink-0 cursor-not-allowed rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white"
                >
                    Save Pool Selection
                </button>
            </div>
        </div>
    );
};

export default DemoPoolSelection;
