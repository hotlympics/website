import StatCard from "../../components/ui/StatCard";
import type { AdminStats } from "../../types/admin";

interface StatsOverviewProps {
    stats: AdminStats | null;
}

const StatsOverview = ({ stats }: StatsOverviewProps) => {
    if (!stats) return null;

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <span className="font-bold text-white">U</span>
                </div>
            ),
        },
        {
            title: "Total Images",
            value: stats.totalImages,
            icon: (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <span className="font-bold text-white">I</span>
                </div>
            ),
        },
        {
            title: "Pool Images",
            value: stats.totalPoolImages,
            icon: (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500">
                    <span className="font-bold text-white">P</span>
                </div>
            ),
        },
        {
            title: "Total Battles",
            value: stats.totalBattles,
            icon: (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                    <span className="font-bold text-white">B</span>
                </div>
            ),
        },
        {
            title: "Gender Split",
            value: `M:${stats.usersByGender.male} F:${stats.usersByGender.female} U:${stats.usersByGender.unknown}`,
            icon: (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                    <span className="font-bold text-white">G</span>
                </div>
            ),
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((card, index) => (
                <StatCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                />
            ))}
        </div>
    );
};

export default StatsOverview;
