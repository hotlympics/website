import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./components/layout/app-layout.js";
import { AuthProvider } from "./context/auth-context";
import ProfilePage from "./pages/profile-page.js";
import RatePage from "./pages/rate-page.js";
import SignInPage from "./pages/sign-in-page.js";
import AdminRoutes from "./routes/admin-routes.js";
import AuthRoutes from "./routes/auth-routes.js";

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        {/* Top-level routes */}
                        <Route path="/" element={<RatePage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Nested route groups */}
                        <Route path="/auth/*" element={<AuthRoutes />} />
                        <Route path="/admin/*" element={<AdminRoutes />} />
                    </Routes>
                </AppLayout>
            </Router>
        </AuthProvider>
    );
};

export default App;
