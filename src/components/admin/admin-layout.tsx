import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/admin/admin-service";
import AdminHeader from "./admin-header";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminService.isLoggedIn()) {
            navigate("/admin/login");
        }
    }, [navigate]);

    useEffect(() => {
        // Add data attribute to body for admin styling
        document.body.setAttribute("data-admin-page", "true");

        // Cleanup when component unmounts
        return () => {
            document.body.removeAttribute("data-admin-page");
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 text-gray-900">
            <AdminHeader title={title} />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
