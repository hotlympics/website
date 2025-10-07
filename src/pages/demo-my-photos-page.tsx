import DemoPhotoGallery from "../components/demo/demo-photo-gallery";
import DemoPoolSelection from "../components/demo/demo-pool-selection";
import SignUpCTA from "../components/demo/signup-cta";
import {
    DEMO_PHOTOS,
    DEMO_POOL_SELECTIONS,
    DEMO_USER,
} from "../data/demo-data";

const DemoMyPhotosPage = () => {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden pb-36 blur-[2px]">
                <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4">
                    {/* Header section */}
                    <div className="flex-shrink-0 pt-4 pb-4">
                        <h1 className="mb-4 text-center text-xl font-bold text-gray-100">
                            My Photos
                        </h1>

                        <DemoPoolSelection
                            poolSelections={DEMO_POOL_SELECTIONS}
                            user={DEMO_USER}
                        />

                        <div className="mt-2 ml-4">
                            <span className="text-sm text-gray-400">
                                {DEMO_PHOTOS.length}/10 photos uploaded
                            </span>
                        </div>
                    </div>

                    {/* Non-scrollable content area - fixed height */}
                    <div className="flex-1 overflow-hidden">
                        <DemoPhotoGallery
                            photos={DEMO_PHOTOS}
                            poolSelections={DEMO_POOL_SELECTIONS}
                        />
                    </div>
                </div>
            </div>

            <SignUpCTA />
        </div>
    );
};

export default DemoMyPhotosPage;
