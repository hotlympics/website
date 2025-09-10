import { useEffect, useRef, useState } from "react";
import { useRatingQueue } from "../../hooks/rating/use-rating-queue.js";
import type { ImageData } from "../../services/core/image-queue.js";
import { imageQueueService } from "../../services/core/image-queue.js";
import { reportService } from "../../services/report-service.js";
import ReportModal, { type ReportCategory } from "../shared/report-modal.js";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card.js";

export const RatingArena = () => {
    const {
        imagePair,
        loadingImages,
        error,
        handleImageClick,
        handleDiscardPair,
    } = useRatingQueue();

    const cardRef = useRef<SwipeCardHandle | null>(null);

    // Report modal state
    const [reportModal, setReportModal] = useState<{
        isOpen: boolean;
        imageData: ImageData | null;
    }>({
        isOpen: false,
        imageData: null,
    });
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

    const handleReportImage = (imageData: ImageData) => {
        setReportModal({
            isOpen: true,
            imageData,
        });
    };

    const handleCloseReportModal = () => {
        setReportModal({
            isOpen: false,
            imageData: null,
        });
        setReportError(null); // Clear any previous errors
    };

    const handleSubmitReport = async (
        category: ReportCategory,
        description?: string
    ) => {
        if (!reportModal.imageData) return;

        setIsSubmittingReport(true);
        setReportError(null); // Clear any previous errors

        try {
            await reportService.submitReport({
                imageId: reportModal.imageData.imageId,
                category,
                description,
            });

            handleCloseReportModal();

            // Discard the current pair and show next images
            await handleDiscardPair();

            console.log("Report submitted successfully");
        } catch (error) {
            console.error("Failed to submit report:", error);
            
            // Handle specific error messages
            const errorMessage = error instanceof Error ? error.message : "Failed to submit report";
            
            if (errorMessage.includes("already reported")) {
                setReportError("You have already reported this image. Thank you for your previous report.");
            } else {
                setReportError("Failed to submit report. Please try again.");
            }
        } finally {
            setIsSubmittingReport(false);
        }
    };

    // Keyboard navigation: ArrowUp selects top, ArrowDown selects bottom
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!imagePair || imagePair.length !== 2) return;

            // Don't trigger swipe if user is typing in an input/textarea or if report modal is open
            const activeElement = document.activeElement;
            const isTyping =
                activeElement &&
                (activeElement.tagName === "INPUT" ||
                    activeElement.tagName === "TEXTAREA" ||
                    (activeElement as HTMLElement).contentEditable === "true");

            if (isTyping || reportModal.isOpen) return;

            if (e.key === "ArrowUp") {
                e.preventDefault();
                cardRef.current?.selectTop();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                cardRef.current?.selectBottom();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [imagePair, reportModal.isOpen]);

    return (
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden">
            {/* Centered content with bottom margin for MenuBar */}
            <div
                className="mt-4 flex w-full flex-grow flex-col items-center justify-center pb-20"
                style={{
                    paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
                }}
            >
                <div className="mx-auto w-full max-w-7xl px-3">
                    {loadingImages ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-xl text-gray-300">
                                Loading images...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <p className="mb-4 text-xl text-red-400">{error}</p>
                            <span className="text-gray-300">
                                We encountered an error. Please refresh the page
                            </span>
                        </div>
                    ) : imagePair && imagePair.length === 2 ? (
                        <div className="flex items-center justify-center py-2">
                            <div
                                className="relative w-full"
                                style={{
                                    maxWidth:
                                        "min(24rem, calc((100dvh - 160px)/2))",
                                    maxHeight: "calc(100dvh - 160px)",
                                }}
                            >
                                {/* Fixed shadow frame that does not move with cards */}
                                <div
                                    className="relative w-full overflow-hidden rounded-2xl bg-gray-800 shadow-[0_18px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
                                    style={{
                                        aspectRatio: "1/2",
                                        maxHeight: "calc(100dvh - 160px)",
                                    }}
                                >
                                    {/* Background next pair, visible from start of swipe */}
                                    {(() => {
                                        const nextPair =
                                            imageQueueService.peekNextPair();
                                        if (
                                            !nextPair ||
                                            nextPair.length !== 2
                                        ) {
                                            return null;
                                        }
                                        return (
                                            <div className="absolute inset-0 z-0">
                                                <SwipeCard
                                                    pair={nextPair}
                                                    readOnly
                                                    bare
                                                    onReportImage={
                                                        handleReportImage
                                                    }
                                                />
                                            </div>
                                        );
                                    })()}

                                    {/* Top swipeable card */}
                                    <div className="absolute inset-0 z-10">
                                        <SwipeCard
                                            ref={cardRef}
                                            key={`${imagePair[0].imageId}-${imagePair[1].imageId}`}
                                            pair={imagePair}
                                            onComplete={handleImageClick}
                                            onReportImage={handleReportImage}
                                            bare
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-32">
                            <p className="text-xl text-gray-300">
                                No images available
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={reportModal.isOpen}
                onClose={handleCloseReportModal}
                onSubmit={handleSubmitReport}
                isLoading={isSubmittingReport}
                error={reportError}
            />
        </div>
    );
};
