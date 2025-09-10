import type { AdminReport } from "../../../../services/admin/admin-service";
import { formatDate } from "../../../../utils/admin/formatters";

interface ReportCardProps {
    report: AdminReport;
    isSelected: boolean;
    onReportClick: (report: AdminReport) => void;
}

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "APPROVED":
            return "bg-green-100 text-green-800";
        case "REJECTED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getCategoryDisplayName = (category: string) => {
    switch (category) {
        case "NOT_PERSON":
            return "Not a Person";
        case "IMPERSONATION":
            return "Impersonation";
        case "NUDITY":
            return "Nudity";
        case "VIOLENCE":
            return "Violence";
        case "SPAM":
            return "Spam";
        case "INAPPROPRIATE":
            return "Inappropriate";
        case "OTHER":
            return "Other";
        default:
            return category;
    }
};

const ReportCard = ({ report, isSelected, onReportClick }: ReportCardProps) => {
    const getRowClasses = () => {
        if (isSelected) {
            return "transition-colors bg-blue-200 hover:bg-blue-250";
        }
        return "transition-colors hover:bg-gray-50";
    };

    return (
        <tr
            className={`${getRowClasses()} cursor-pointer`}
            onClick={() => onReportClick(report)}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                    {formatTime(report.createdAt)}
                </div>
                <div className="text-sm text-gray-500">
                    {formatDate(report.createdAt)}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {report.imageOwnerEmail ? (
                    <div className="text-sm text-gray-900">
                        {report.imageOwnerEmail}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">[Deleted User]</div>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                    {getCategoryDisplayName(report.category)}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        report.status
                    )}`}
                >
                    {report.status.replace("_", " ")}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {report.reviewedAt && (
                    <div className="text-sm text-gray-900">
                        {formatDate(report.reviewedAt)}
                    </div>
                )}
                {report.reviewedBy && (
                    <div className="text-sm text-gray-500">
                        By: {report.reviewedBy}
                    </div>
                )}
            </td>
        </tr>
    );
};

export default ReportCard;
