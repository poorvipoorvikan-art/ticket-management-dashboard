import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoadingFallback from "../components/LoadingFallback";

const Login = lazy(() => import("../Login/Login"));
const TicketDashboard = lazy(
  () => import("../pages/TicketDashboard")
);
const Unauthorized = lazy(
  () => import("../pages/Unauthorized")
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<TicketDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}