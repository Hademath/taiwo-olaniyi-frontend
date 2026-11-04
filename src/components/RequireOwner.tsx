import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth";

export function RequireOwner() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  return token ? <Outlet /> : <Navigate to="/owner-login" replace state={{ from: location.pathname }} />;
}