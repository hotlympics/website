import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import EmailVerificationHandler from "./pages/email-verification-handler";
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
                    <Route
                        path="/verify"
                        element={<EmailVerificationHandler />}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
