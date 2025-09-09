import { useEffect, useState } from "react";
import ReportTable from "../../../components/admin/management/moderation/report-table";
import SearchInput from "../../../components/admin/shared/search-input";
import SearchButton from "../../../components/admin/shared/search-button";
import RefreshButton from "../../../components/admin/shared/refresh-button";
import ErrorMessage from "../../../components/admin/shared/error-message";
import InlineLoadingState from "../../../components/admin/shared/inline-loading-state";
import { useReports } from "../../../hooks/admin/use-reports";
import {
    adminService,
    type AdminReport,
    type ReportStatus,
} from "../../../services/admin/admin-service";

const ModerationTab = ({
    onNavigateToUsers,
}: {
    onNavigateToUsers?: (email: string, userId?: string) => void;
}) => {
    const {
        reports,
        loading,
        error,
        setError,
        loadData,
        statusFilter,
        changeStatusFilter,
        updateReport,
        searchEmail,
        setSearchEmail,
        hasSearched,
        searchMessage,
        searchReportsByEmail,
        refreshData,
    } = useReports();

    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
        null
    );
    const [reportedImageUrl, setReportedImageUrl] = useState<string>("");
    const [imageNotFound, setImageNotFound] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Load initial data
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = async () => {
        await searchReportsByEmail(searchEmail);
    };

    const handleClearSearch = async () => {
        setSearchEmail("");
        await loadData();
    };

    const handleReportClick = async (report: AdminReport) => {
        setSelectedReport(report);
        setReportedImageUrl("");
        setImageNotFound(false);

        try {
            const result = await adminService.getImageUrl(report.imageId);
            setReportedImageUrl(result.imageUrl);
        } catch (err) {
            console.error("Failed to fetch image URL:", err);
            setReportedImageUrl("");
            setImageNotFound(true); // Mark that image was not found
        }
    };

    const handleStatusUpdate = async (
        reportId: string,
        newStatus: ReportStatus,
        adminNotes?: string
    ) => {
        setUpdating(true);
        try {
            await adminService.updateReportStatus(
                reportId,
                newStatus,
                adminNotes
            );

            // Update the report in local state regardless of status
            const updatedReport: AdminReport = {
                ...reports.find((r) => r.reportID === reportId)!,
                status: newStatus,
                reviewedAt: new Date().toISOString(),
                reviewedBy: "admin",
                adminNotes: adminNotes || undefined,
            };

            updateReport(updatedReport);

            // Update selected report if it's the one being updated
            if (selectedReport?.reportID === reportId) {
                setSelectedReport(updatedReport);

                // If the report was approved, mark that the image is no longer available
                if (newStatus === "APPROVED") {
                    setImageNotFound(true);
                }
            }

            // Show success message with action taken
            if (newStatus === "APPROVED") {
                setError(""); // Clear any previous errors
                console.log("Report approved - image deleted from system");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update report status"
            );
        } finally {
            setUpdating(false);
        }
    };

    const getStatusFilterOptions = (): {
        value: ReportStatus | "ALL";
        label: string;
    }[] => [
        { value: "ALL", label: "All Reports" },
        { value: "PENDING", label: "Pending" },
        { value: "UNDER_REVIEW", label: "Under Review" },
        { value: "APPROVED", label: "Approved" },
        { value: "REJECTED", label: "Rejected" },
        { value: "DUPLICATE", label: "Duplicate" },
    ];

    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
            {/* Header - Full Width */}
            <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Report Moderation
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {hasSearched
                                ? `Showing reports for images owned by: ${searchEmail}`
                                : "Review and moderate user reports (showing first 10)"}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {!hasSearched && (
                            <>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        changeStatusFilter(
                                            e.target.value as
                                                | ReportStatus
                                                | "ALL"
                                        )
                                    }
                                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                >
                                    {getStatusFilterOptions().map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <RefreshButton
                                    onClick={() => refreshData()}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </>
                        )}
                        {hasSearched && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                disabled={loading}
                                className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                            >
                                Clear Search
                            </button>
                        )}
                        <SearchInput
                            value={searchEmail}
                            onChange={setSearchEmail}
                            placeholder="Search by email..."
                        />
                        <SearchButton
                            onClick={handleSearch}
                            loading={loading}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Error Message - Full Width */}
            {error && <ErrorMessage message={error} />}

            {/* Search Message - Full Width */}
            {searchMessage && (
                <div className="border-l-4 border-yellow-400 bg-yellow-50 px-4 py-3">
                    <div className="text-sm text-yellow-700">
                        {searchMessage}
                    </div>
                </div>
            )}

            {/* Main Content - Split Layout */}
            <div className="flex">
                {/* Left Side - Reports Table (70% width) */}
                <div style={{ width: "70%" }}>
                    {loading ? (
                        <InlineLoadingState
                            message={
                                hasSearched
                                    ? "Searching reports..."
                                    : "Loading reports..."
                            }
                        />
                    ) : hasSearched || reports.length > 0 ? (
                        <ReportTable
                            reports={reports}
                            selectedReport={selectedReport}
                            onReportClick={handleReportClick}
                            onNavigateToUsers={onNavigateToUsers}
                        />
                    ) : (
                        <div className="py-12 text-center">
                            <p className="mt-2 text-sm text-gray-500">
                                {hasSearched
                                    ? `No reports found for images owned by "${searchEmail}"`
                                    : "No reports found. Use search to find reports by image owner email."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Side - Image and Actions (30% width) */}
                <div
                    style={{ width: "30%" }}
                    className="border-l border-gray-200 bg-gray-50 p-6"
                >
                    {selectedReport ? (
                        <div className="space-y-4">
                            {/* Reported Image */}
                            <div className="text-center">
                                {reportedImageUrl ? (
                                    <div className="aspect-square w-full overflow-hidden rounded-lg shadow-md">
                                        <img
                                            src={reportedImageUrl}
                                            alt={`Reported image ${selectedReport.imageId}`}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                ) : imageNotFound ? (
                                    <div className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-red-300 bg-red-100">
                                        <div className="text-center">
                                            <div className="font-medium text-red-600">
                                                Image Not Found
                                            </div>
                                            <div className="mt-1 text-sm text-red-500">
                                                {selectedReport.status ===
                                                "APPROVED"
                                                    ? "Image was deleted"
                                                    : "Image no longer exists"}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200">
                                        <span className="text-gray-400">
                                            Loading image...
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Report Details */}
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">
                                        Report ID:
                                    </div>
                                    <div className="text-gray-600">
                                        {selectedReport.reportID.slice(-8)}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">
                                        Image ID:
                                    </div>
                                    <div className="text-gray-600">
                                        {selectedReport.imageId}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">
                                        Reporter:
                                    </div>
                                    <div className="text-gray-600">
                                        {selectedReport.userId === "anonymous"
                                            ? "Anonymous"
                                            : selectedReport.userId}
                                    </div>
                                </div>
                                {selectedReport.description && (
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            Description:
                                        </div>
                                        <div className="mt-1 rounded border bg-white p-2 text-xs text-gray-600">
                                            {selectedReport.description}
                                        </div>
                                    </div>
                                )}
                                {selectedReport.adminNotes && (
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">
                                            Admin Notes:
                                        </div>
                                        <div className="mt-1 rounded border bg-white p-2 text-xs text-gray-600">
                                            {selectedReport.adminNotes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedReport.reportID,
                                            "UNDER_REVIEW"
                                        )
                                    }
                                    disabled={
                                        updating ||
                                        selectedReport.status === "UNDER_REVIEW"
                                    }
                                    className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Mark Under Review
                                </button>
                                <button
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedReport.reportID,
                                            "APPROVED"
                                        )
                                    }
                                    disabled={
                                        updating ||
                                        selectedReport.status === "APPROVED"
                                    }
                                    className="w-full rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                    title="Approve report and permanently delete image"
                                >
                                    {updating
                                        ? "Deleting..."
                                        : "Approve & Delete Image"}
                                </button>
                                <button
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedReport.reportID,
                                            "REJECTED"
                                        )
                                    }
                                    disabled={
                                        updating ||
                                        selectedReport.status === "REJECTED"
                                    }
                                    className="w-full rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Reject Report
                                </button>
                                <button
                                    onClick={() =>
                                        handleStatusUpdate(
                                            selectedReport.reportID,
                                            "DUPLICATE"
                                        )
                                    }
                                    disabled={
                                        updating ||
                                        selectedReport.status === "DUPLICATE"
                                    }
                                    className="w-full rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Mark Duplicate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200">
                            <span className="text-gray-400">
                                Select a report to view details
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModerationTab;
