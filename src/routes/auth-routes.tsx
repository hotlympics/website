import { Route, Routes } from "react-router-dom";
import AuthVerifyPage from "../pages/auth-verify.js";

const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="/verify" element={<AuthVerifyPage />} />
        </Routes>
    );
};

export default AuthRoutes;
