import { useEffect, useRef, useState } from "react";
import { useRatingQueue } from "../../hooks/rating/use-rating-queue.js";
import type { ImageData } from "../../services/core/image-queue.js";
import { reportService } from "../../services/report-service.js";
import ReportModal, { type ReportCategory } from "../shared/report-modal.js";
import { SettingsModal } from "../shared/settings-modal.js";
import { CardContainer } from "./card-container.js";
import { EmptyState } from "./empty-state.js";
import { ErrorState } from "./error-state.js";
import { LoadingState } from "./loading-state.js";
import { MainContentArea } from "./main-content-area.js";
import { type SwipeCardHandle } from "./swipe-card.js";

export const RatingArena = () => {
    const {
        imagePair,
        loadingImages,
        error,
        handleImageClick,
        handleDiscardPair,
        viewingGender,
        changeViewingGender,
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

    // Settings modal state
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleOpenSettingsModal = () => {
        setIsSettingsModalOpen(true);
    };

    const handleCloseSettingsModal = () => {
        setIsSettingsModalOpen(false);
    };

    const handleGenderChange = (newGender: "male" | "female") => {
        changeViewingGender(newGender);
        setIsSettingsModalOpen(false);
    };

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
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to submit report";

            if (errorMessage.includes("already reported")) {
                setReportError(
                    "You have already reported this image. Thank you for your previous report."
                );
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

            if (isTyping || reportModal.isOpen || isSettingsModalOpen) return;

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
    }, [imagePair, reportModal.isOpen, isSettingsModalOpen]);

    return (
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden">
            <MainContentArea>
                {loadingImages ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} />
                ) : imagePair && imagePair.length === 2 ? (
                    <CardContainer
                        ref={cardRef}
                        imagePair={imagePair}
                        onComplete={handleImageClick}
                        onReportImage={handleReportImage}
                        onSettingsClick={handleOpenSettingsModal}
                    />
                ) : (
                    <EmptyState />
                )}
            </MainContentArea>

            <ReportModal
                isOpen={reportModal.isOpen}
                onClose={handleCloseReportModal}
                onSubmit={handleSubmitReport}
                isLoading={isSubmittingReport}
                error={reportError}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleCloseSettingsModal}
                currentGender={viewingGender || "female"}
                onApply={handleGenderChange}
            />
        </div>
    );
};
