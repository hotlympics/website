import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageElement } from "./image-element.js";
import { ImageData } from "../../services/core/image-service.js";

const ImagesCard: React.FC<{
    ImagePair: ImageData[];
    handleImageClick: (selectedImage: ImageData) => Promise<void>;
}> = ({ ImagePair, handleImageClick }) => {
    const [cards, setCards] = useState<ImageData[][]>([ImagePair]);
    const [swipeDirection, setSwipeDirection] = useState<"up" | "down" | null>(null);

    // Add a new card to the stack when the component mounts or when cards are running low
    useEffect(() => {
        // This is a placeholder for fetching new image pairs.
        // You would replace this with your actual data fetching logic.
        if (cards.length < 2) {
            // Example: Add a new dummy pair
            const newPair = [...ImagePair].reverse(); // Just an example of a new pair
            setCards((prev) => [...prev, newPair]);
        }
    }, [cards, ImagePair]);

    const handleSwipe = (direction: "up" | "down", image: ImageData) => {
        setSwipeDirection(direction);
        handleImageClick(image);

        setTimeout(() => {
            setCards((prev) => prev.slice(0, prev.length - 1));
            setSwipeDirection(null);
        }, 500); // Corresponds to the animation duration
    };

    const animationVariants = {
        up: { y: -200},
        down: { y: 200},
        initial: { y: 0 },
    };

    return (
        <div className="overflow-hidden h-[90svh]">

            <div className="relative w-full max-w-md h-96 mx-auto">
                <AnimatePresence>
                    {cards.map((pair, index) => {
                        const isTopCard = index === cards.length - 1;
                        return (
                            <motion.div
                                key={index}
                                className="absolute top-0 left-0 w-full"
                                style={{ zIndex: index }}
                                initial="initial"
                                animate={isTopCard ? (swipeDirection || "initial") : "initial"}
                                variants={animationVariants}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-gray-100 p-6 rounded-2xl shadow-md w-full">
                                    <div className="flex flex-col items-center justify-center">
                                        <ImageElement
                                            ImagePair={pair}
                                            top={true}
                                            onClick={() => isTopCard && handleSwipe("up", pair[0])}
                                        />
                                        <p className="text-xl text-gray-600 my-4">Pick who you prefer</p>
                                        <ImageElement
                                            ImagePair={pair}
                                            top={false}
                                            onClick={() => isTopCard && handleSwipe("down", pair[1])}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ImagesCard;