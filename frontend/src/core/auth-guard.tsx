import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../modules/auth/store/auth.store.js';

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Učitavanje...</p>
    </div>
  );
}

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  if (!isInitialized) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  if (!isInitialized) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function ProfileCompleteGuard() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (user && !user.profileComplete && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export function AdminGuard() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'BUILDING_ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
