import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: Tạm thời bỏ qua check role — tất cả account đều có thể vào /admin
  // const { user } = useAuth();
  // if (!user) {
  //   return <Navigate to="/auth" replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
