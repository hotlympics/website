import { useNavigate } from "react-router-dom";
import { adminService } from "../services/admin-service";
import AdminNavigation from "./admin-navigation";

interface AdminHeaderProps {
    title?: string;
}

const AdminHeader = ({ title = "Admin Dashboard" }: AdminHeaderProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        adminService.logout();
        navigate("/admin/login");
    };

    return (
        <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {title}
                    </h1>
                    <div className="flex items-center space-x-8">
                        <AdminNavigation />
                        <button
                            onClick={handleLogout}
                            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
