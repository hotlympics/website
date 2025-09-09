import { useCallback, useState } from "react";
import { adminService } from "../../services/admin/admin-service";
import type { AdminReport, ReportStatus } from "../../utils/types/admin/admin";

export const useReports = () => {
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">(
        "ALL"
    );
    const [searchEmail, setSearchEmail] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [searchMessage, setSearchMessage] = useState("");

    const loadData = useCallback(
        async (status?: ReportStatus | "ALL") => {
            try {
                setLoading(true);
                setError("");
                setSearchMessage("");

                const statusToUse =
                    status !== undefined ? status : statusFilter;
                const filterStatus =
                    statusToUse === "ALL" ? undefined : statusToUse;

                const data = await adminService.getReports(
                    filterStatus,
                    10, // Always get 10 items, no pagination
                    undefined, // No startAfter
                    undefined // No endBefore
                );

                setReports(data.reports);
                setSearchEmail("");
                setHasSearched(false);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load reports"
                );
            } finally {
                setLoading(false);
            }
        },
        [statusFilter]
    );

    const searchReportsByEmail = useCallback(async (email: string) => {
        if (!email.trim()) {
            setError("Please enter an email to search");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSearchMessage("");
            setHasSearched(true);

            const data = await adminService.searchReportsByEmail(
                email.trim(),
                50 // Get more results for email search
            );

            setReports(data.reports);
            setSearchEmail(email.trim());
            if (data.message) {
                setSearchMessage(data.message);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to search reports by email"
            );
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const changeStatusFilter = useCallback(
        async (newStatus: ReportStatus | "ALL") => {
            setStatusFilter(newStatus);
            await loadData(newStatus);
        },
        [loadData]
    );

    const refreshData = useCallback(async () => {
        if (hasSearched && searchEmail) {
            await searchReportsByEmail(searchEmail);
        } else {
            await loadData();
        }
    }, [loadData, searchReportsByEmail, hasSearched, searchEmail]);

    const updateReport = useCallback((updatedReport: AdminReport) => {
        setReports((prevReports) =>
            prevReports.map((report) =>
                report.reportID === updatedReport.reportID
                    ? updatedReport
                    : report
            )
        );
    }, []);

    return {
        reports,
        setReports,
        loading,
        error,
        setError,
        loadData,
        statusFilter,
        changeStatusFilter,
        refreshData,
        updateReport,
        searchEmail,
        setSearchEmail,
        hasSearched,
        searchMessage,
        searchReportsByEmail,
    };
};
