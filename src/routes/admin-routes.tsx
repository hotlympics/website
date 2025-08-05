import { Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "../pages/admin/admin-login-page.js";
import AdvancedPage from "../pages/admin/advanced-page.js";
import AnalyticsPage from "../pages/admin/analytics-page.js";
import ManagementPage from "../pages/admin/management-page.js";
import OperationsPage from "../pages/admin/operations-page.js";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route
                path="/dashboard"
                element={<Navigate to="/admin/management" replace />}
            />
            <Route
                path="/"
                element={<Navigate to="/admin/management" replace />}
            />
            <Route path="/management" element={<ManagementPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/advanced" element={<AdvancedPage />} />
        </Routes>
    );
};

export default AdminRoutes;
