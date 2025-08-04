import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import UsersPage from "./admin/users/UsersPage";
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
                    <Route path="/admin/dashboard" element={<UsersPage />} />
                    <Route path="/admin" element={<AdminLoginPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
