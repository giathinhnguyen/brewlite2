"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Navigate } from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  if (loading) return <p role="status" className="px-6 py-16 text-center">Đang kiểm tra phiên đăng nhập...</p>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname + (search ? `?${search}` : ""))}`} replace />;
  return children;
}
