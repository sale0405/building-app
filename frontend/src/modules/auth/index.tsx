import { Navigate } from 'react-router-dom';
import { moduleRegistry } from '../../core/module-registry.js';
import { useAuthStore } from './store/auth.store.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

export function registerAuthModule() {
  moduleRegistry.register({
    routes: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
    navItems: [],
  });
}

export function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user && !user.profileComplete) {
    return <Navigate to="/profile" replace />;
  }
  return <Navigate to="/chat" replace />;
}

