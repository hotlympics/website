import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ImageElement } from "./image-element.js";
import { ImageData } from "../../services/core/image-service.js";
import { useRating } from "../../hooks/rating/use-rating.js";

const ImagesCard: React.FC = () => {
    const {
        imagePair,
        loadingImages,
        error,
        fetchImagePair,
        handleImageClick,
    } = useRating();

    // Initialize cards with imagePair only if it exists and has length 2
    const [cards, setCards] = useState<ImageData[][]>(() =>
        imagePair && imagePair.length === 2 ? [imagePair] : []
    );

    // When imagePair changes or cards length is low, add a new reversed pair
    useEffect(() => {
        if (
            imagePair &&
            imagePair.length === 2 &&
            cards.length < 2 &&
            // prevent duplicate addition by checking last card
            (!cards.length || cards[cards.length - 1] !== imagePair)
        ) {
            const newPair = [...imagePair].reverse();
            setCards((prev) => [...prev, newPair]);
        }
    }, [cards, imagePair]);

    // Extract swipe logic to reuse in drag and keyboard
    const swipeCard = useCallback(
        async (direction: "up" | "down") => {
            if (cards.length === 0) return;

            const topPair = cards[cards.length - 1];
            if (direction === "up") {
                await handleImageClick(topPair[0]);
            } else {
                await handleImageClick(topPair[1]);
            }
            setCards((prev) => prev.slice(0, prev.length - 1));
        },
        [cards, handleImageClick]
    );

    const handleDragEnd = async (
        info: PanInfo,
    ) => {
        const offsetY = info.offset.y;

        if (offsetY < -100) {
            await swipeCard("up");
        } else if (offsetY > 100) {
            await swipeCard("down");
        }
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") {
                swipeCard("up");
            } else if (e.key === "ArrowDown") {
                swipeCard("down");
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [swipeCard]);

    return (
        <>
            {loadingImages ? (
                <div className="flex items-center justify-center py-32">
                    <div className="text-xl text-gray-600">{/*Loading images...*/}</div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <p className="mb-4 text-xl text-red-600">{error}</p>
                    <button
                        onClick={fetchImagePair}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : cards.length > 0 ? (
                <div className="overflow-hidden h-[90svh]">
                    <div className="relative w-full max-w-md h-96 mx-auto">
                        <AnimatePresence>
                            <motion.div
                                key={cards.length}
                                className="absolute top-0 left-0 w-full"
                                drag="y"
                                dragElastic={0.5}
                                onDragEnd={(e, info) => {
                                    handleDragEnd(info);
                                }}
                                initial={{ y: 0, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <div className="bg-gray-100 p-6 rounded-2xl shadow-md w-full">
                                    <div className="flex flex-col items-center justify-center">
                                        <div>
                                            <ImageElement
                                                ImagePair={cards[cards.length - 1]}
                                                top={true}
                                            />
                                        </div>
                                        <p className="text-xl text-gray-600 my-4">
                                            Swipe up or down
                                        </p>
                                        <div>
                                            <ImageElement
                                                ImagePair={cards[cards.length - 1]}
                                                top={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center py-32">
                    <p className="text-xl text-gray-600">No images available</p>
                </div>
            )}
        </>
    );
};

export default ImagesCard;
