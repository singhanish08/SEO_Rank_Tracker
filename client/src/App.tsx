import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import VerificationBanner from "./components/VerificationBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";
import { useApp } from "./context/AppContext";
import Loading from "./components/Loading";

export default function App() {
    const {user, loading} = useApp()
    const location = useLocation();

    const hideNavbar = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"].includes(location.pathname);

    if(loading) return <Loading/>

    return (
        <>
            <Toaster />
            {!hideNavbar && <Navbar />}
            <div className={!hideNavbar ? "pt-16 md:pt-24" : ""}>
                <VerificationBanner />
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={user ? <Navigate to='/dashboard' replace/> : <Login state="login" />} />
                <Route path="/register" element={user ? <Navigate to='/dashboard' replace/> : <Login state="register" />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/report/:id" element={<Report />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/rank-tracker" element={<RankTracker />} />
                    <Route path="/rank/:id" element={<RankDetail />} />
                </Route>
            </Routes>
            </div>
        </>
    );
}
