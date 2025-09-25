import { useState } from "react";
import SignUpCTA from "../components/demo/signup-cta";
import DeleteConfirmationModal from "../components/profile/delete-confirmation-modal";
import PhotoGallery from "../components/profile/photo-gallery";
import PoolSelection from "../components/profile/pool-selection";
import {
    DEMO_PHOTOS,
    DEMO_POOL_SELECTIONS,
    DEMO_USER,
} from "../data/demo-data";

interface DeleteConfirmation {
    photoId: string;
    isInPool: boolean;
}

const DemoMyPhotosPage = () => {
    const [deleteConfirmation, setDeleteConfirmation] =
        useState<DeleteConfirmation | null>(null);
    const [showDemoTooltip, setShowDemoTooltip] = useState<string | null>(null);

    // Demo handlers that show tooltips instead of real actions
    const handleDeletePhoto = (photoId: string) => {
        const isInPool = DEMO_POOL_SELECTIONS.has(photoId);
        setDeleteConfirmation({ photoId, isInPool });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        setDeleteConfirmation(null);
        // Show demo tooltip instead of actually deleting
        setShowDemoTooltip("delete");
        setTimeout(() => setShowDemoTooltip(null), 3000);
    };

    const handlePoolToggle = (_photoId: string) => {
        setShowDemoTooltip("pool-toggle");
        setTimeout(() => setShowDemoTooltip(null), 3000);
    };

    const handlePoolUpdate = async () => {
        setShowDemoTooltip("pool-update");
        setTimeout(() => setShowDemoTooltip(null), 3000);
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden blur-[3px]">
                <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4">
                    {/* Header section */}
                    <div className="flex-shrink-0 pt-8 pb-4">
                        <h1 className="mb-4 text-center text-xl font-bold text-gray-100">
                            My Photos
                        </h1>

                        <PoolSelection
                            poolSelections={DEMO_POOL_SELECTIONS}
                            user={DEMO_USER}
                            isUpdating={false}
                            onUpdatePool={handlePoolUpdate}
                        />

                        <div className="mt-2 ml-4">
                            <span className="text-sm text-gray-400">
                                {DEMO_PHOTOS.length}/10 photos uploaded
                            </span>
                        </div>

                        {/* Demo tooltip messages */}
                        {showDemoTooltip && (
                            <div className="mx-4 mt-4 rounded-lg bg-blue-600 p-3 text-center text-white">
                                {showDemoTooltip === "pool-toggle" &&
                                    "🎪 Demo mode - Sign up to manage your photo pool!"}
                                {showDemoTooltip === "pool-update" &&
                                    "🎪 Demo mode - Sign up to save pool changes!"}
                                {showDemoTooltip === "delete" &&
                                    "🎪 Demo mode - Sign up to delete photos!"}
                            </div>
                        )}
                    </div>

                    {/* Non-scrollable content area - fixed height */}
                    <div className="flex-1 overflow-hidden">
                        <PhotoGallery
                            photos={DEMO_PHOTOS}
                            poolSelections={DEMO_POOL_SELECTIONS}
                            onPoolToggle={handlePoolToggle}
                            onDeletePhoto={handleDeletePhoto}
                            deletingPhoto={null}
                        />
                    </div>
                </div>
            </div>

            <SignUpCTA />

            <DeleteConfirmationModal
                isOpen={!!deleteConfirmation}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={confirmDelete}
                title="Delete Photo (Demo)"
                message="🎪 This is demo mode! Sign up to upload and manage your own photos."
            />
        </div>
    );
};

export default DemoMyPhotosPage;
