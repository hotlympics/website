import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RatePage = () => {
    const navigate = useNavigate();
    const [leftImage] = useState<string>("");
    const [rightImage] = useState<string>("");

    const handleImageClick = (selectedImage: string) => {
        const winnerId = selectedImage;
        const loserId = selectedImage === leftImage ? rightImage : leftImage;

        console.log(`Winner: ${winnerId}, Loser: ${loserId}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-7xl">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => navigate("/signin")}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                        Add your photo
                    </button>
                </div>
                <div className="mb-6 text-center">
                    <h1 className="mb-6 text-4xl font-bold text-gray-800">
                        Hotlympics Rating Arena
                    </h1>
                    <p className="text-xl text-gray-600">Pick who you prefer</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
                    <div
                        className="cursor-pointer"
                        onClick={() => handleImageClick(leftImage)}
                    >
                        <img
                            src={leftImage}
                            alt="Left face"
                            className="h-96 w-full max-w-md rounded-lg object-cover shadow-lg transition-transform hover:scale-105"
                        />
                    </div>

                    <div
                        className="cursor-pointer"
                        onClick={() => handleImageClick(rightImage)}
                    >
                        <img
                            src={rightImage}
                            alt="Right face"
                            className="h-96 w-full max-w-md rounded-lg object-cover shadow-lg transition-transform hover:scale-105"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RatePage;
