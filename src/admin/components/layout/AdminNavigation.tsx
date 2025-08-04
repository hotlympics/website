import { useLocation, useNavigate } from "react-router-dom";

interface AdminNavigationProps {
    className?: string;
}

const AdminNavigation = ({ className = "" }: AdminNavigationProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
        { name: "Users", path: "/admin/dashboard", icon: "👥" },
        // Future navigation items will be added here
        // { name: "Statistics", path: "/admin/statistics", icon: "📊" },
        // { name: "Battles", path: "/admin/battles", icon: "⚔️" },
        // { name: "Logs", path: "/admin/logs", icon: "📋" },
        // { name: "Costs", path: "/admin/costs", icon: "💰" },
    ];

    return (
        <nav className={`flex space-x-4 ${className}`}>
            {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.name}
                    </button>
                );
            })}
        </nav>
    );
};

export default AdminNavigation;
