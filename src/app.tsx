import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AccountPage from "./pages/account-page";
import AuthCallback from "./pages/auth-callback";
import RatePage from "./pages/rate-page";
import SignInPage from "./pages/sign-in-page";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<RatePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route
                    path="/auth/:provider/callback"
                    element={<AuthCallback />}
                />
            </Routes>
        </Router>
    );
};

export default App;
