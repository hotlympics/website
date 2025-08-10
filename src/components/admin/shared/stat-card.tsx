import type { StatCardProps } from "../../../utils/types/admin/common";

const StatCard = ({ title, value, icon, className = "" }: StatCardProps) => {
    return (
        <div
            className={`overflow-hidden rounded-lg bg-white shadow ${className}`}
        >
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-gray-500">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
