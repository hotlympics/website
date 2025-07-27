import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import RatePage from "./pages/rate-page";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<RatePage />} />
            </Routes>
        </Router>
    );
}

export default App;
