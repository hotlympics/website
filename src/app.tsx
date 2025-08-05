import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import AdminLoginPage from "./pages/admin/admin-login-page";
import AdvancedPage from "./pages/admin/advanced-page";
import AnalyticsPage from "./pages/admin/analytics-page";
import ManagementPage from "./pages/admin/management-page";
import OperationsPage from "./pages/admin/operations-page";
import AuthVerifyPage from "./pages/auth-verify";
import ProfilePage from "./pages/profile-page";
import RatePage from "./pages/rate-page";
import SignInPage from "./pages/sign-in-page";

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<RatePage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth/verify" element={<AuthVerifyPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                        path="/admin/dashboard"
                        element={<Navigate to="/admin/management" replace />}
                    />
                    <Route
                        path="/admin"
                        element={<Navigate to="/admin/management" replace />}
                    />

                    {/* Main Admin Sections */}
                    <Route
                        path="/admin/management"
                        element={<ManagementPage />}
                    />
                    <Route
                        path="/admin/analytics"
                        element={<AnalyticsPage />}
                    />
                    <Route
                        path="/admin/operations"
                        element={<OperationsPage />}
                    />
                    <Route path="/admin/advanced" element={<AdvancedPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
