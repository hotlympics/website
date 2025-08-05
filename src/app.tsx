import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import AdvancedPage from "./admin/advanced/AdvancedPage";
import AnalyticsPage from "./admin/analytics/AnalyticsPage";
import ManagementPage from "./admin/management/ManagementPage";
import OperationsPage from "./admin/operations/OperationsPage";
import { AuthProvider } from "./context/auth-context";
import AdminLoginPage from "./pages/admin-login-page";
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
