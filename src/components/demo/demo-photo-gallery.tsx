import { UploadedPhoto } from "../../hooks/profile/use-photo-upload";

interface DemoPhotoGalleryProps {
    photos: UploadedPhoto[];
    poolSelections: Set<string>;
}

const DemoPhotoGallery = ({
    photos,
    poolSelections,
}: DemoPhotoGalleryProps) => {
    return (
        <div className="grid grid-cols-2 gap-3 px-0 py-4">
            {photos.map((photo) => {
                const isInPool = poolSelections.has(photo.id);
                return (
                    <div
                        key={photo.id}
                        className={`group relative aspect-square overflow-hidden rounded-lg border-4 bg-gray-700 ${
                            isInPool ? "border-green-500" : "border-transparent"
                        }`}
                    >
                        <img
                            src={photo.url}
                            alt="Demo photo"
                            className="h-full w-full object-cover"
                            onError={() => {
                                console.log(
                                    `Failed to load demo image ${photo.id}.`
                                );
                            }}
                        />

                        {/* Pool indicator */}
                        {isInPool && (
                            <div className="absolute top-2 left-2 rounded-full bg-green-500 p-2 text-white">
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}

                        {/* ELO Score */}
                        <div className="absolute bottom-1 left-1 rounded bg-black px-2 py-0.5 text-sm font-medium text-white">
                            {Math.round(photo.glicko.rating)}
                        </div>

                        {/* Win/Loss Tracker */}
                        <div className="absolute right-1 bottom-1 rounded bg-black px-2 py-0.5 text-sm font-medium">
                            <span className="text-green-500">{photo.wins}</span>
                            <span className="text-white">/</span>
                            <span className="text-red-600">{photo.losses}</span>
                        </div>

                        {/* Delete button (visible but non-functional in demo) */}
                        <button
                            className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700"
                            title="Delete photo"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default DemoPhotoGallery;
