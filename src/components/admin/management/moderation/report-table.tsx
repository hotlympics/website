import type { AdminReport } from "../../../../services/admin/admin-service";
import EmptyState from "../../shared/empty-state";
import ReportCard from "./report-card";

interface ReportTableProps {
    reports: AdminReport[];
    selectedReport: AdminReport | null;
    onReportClick: (report: AdminReport) => void;
    onNavigateToUsers?: (email: string, userId?: string) => void;
}

const ReportTable = ({
    reports,
    selectedReport,
    onReportClick,
    onNavigateToUsers,
}: ReportTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Image Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Reviewed
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <ReportCard
                                key={report.reportID}
                                report={report}
                                isSelected={
                                    selectedReport?.reportID === report.reportID
                                }
                                onReportClick={onReportClick}
                                onNavigateToUsers={onNavigateToUsers}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5}>
                                <EmptyState
                                    title="No reports found"
                                    description="No reports match the current filters"
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
