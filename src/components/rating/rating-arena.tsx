import PerformanceMonitor from "../shared/performance-monitor.js";
import ImagesCard from "./images-card.js";
import MenuBar from "./menu.js";

export const RatingArena = () => {
    return (
        <div className="relative flex h-screen flex-col items-center justify-between overflow-hidden bg-gray-100">
            {/* Centered content with bottom margin */}
            <div className="mt-4 flex w-full flex-grow flex-col items-center justify-center pb-28">
                <div className="w-full max-w-3xl">
                    <ImagesCard />
                </div>
            </div>

            {/* MenuBar pinned to bottom, same width as ImagesCard */}
            <div className="absolute bottom-0 mb-4 flex w-full justify-center">
                <div className="w-full max-w-3xl">
                    <MenuBar />
                </div>
            </div>

            {/* Optional monitor at the absolute bottom */}
            <PerformanceMonitor />
        </div>
    );
};
