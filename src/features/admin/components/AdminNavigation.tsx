import { useLocation, useNavigate } from "react-router-dom";

interface AdminNavigationProps {
    className?: string;
}

const AdminNavigation = ({ className = "" }: AdminNavigationProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
        { name: "Management", path: "/admin/management" },
        { name: "Analytics", path: "/admin/analytics" },
        { name: "System Operations", path: "/admin/operations" },
        { name: "Advanced Features", path: "/admin/advanced" },
    ];

    return (
        <nav className={`flex space-x-4 ${className}`}>
            {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {item.name}
                    </button>
                );
            })}
        </nav>
    );
};

export default AdminNavigation;
