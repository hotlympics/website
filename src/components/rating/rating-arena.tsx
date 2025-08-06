import PerformanceMonitor from "../shared/performance-monitor.js";
import ImagesCard from "./images-card.js";
import MenuBar from "./menu.js";

export const RatingArena = () => {
    return (
        <div className="h-screen overflow-hidden bg-gray-100 flex flex-col items-center justify-between relative">
            {/* Centered content with bottom margin */}
            <div className="flex-grow flex flex-col items-center justify-center pb-28 w-full mt-4">
                <div className="w-full max-w-3xl">
                    <ImagesCard />
                </div>
            </div>

            {/* MenuBar pinned to bottom, same width as ImagesCard */}
            <div className="absolute bottom-0 w-full flex justify-center mb-4">
                <div className="w-full max-w-3xl">
                    <MenuBar />
                </div>
            </div>

            {/* Optional monitor at the absolute bottom */}
            <PerformanceMonitor />
        </div>
    );
};
