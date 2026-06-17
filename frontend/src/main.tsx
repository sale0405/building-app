import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AppLayout } from './core/AppLayout.js';
import { AuthGuard, GuestGuard, ProfileCompleteGuard } from './core/auth-guard.js';
import { moduleRegistry } from './core/module-registry.js';
import { useAuthStore } from './modules/auth/store/auth.store.js';
import { HomeRedirect, registerAuthModule } from './modules/auth/index.tsx';
import { registerUserProfileModule } from './modules/user-profile/index.tsx';
import { registerNotificationsModule } from './modules/notifications/index.tsx';
import { registerChatModule } from './modules/chat/index.tsx';
import { registerSmokeBreakModule } from './modules/smoke-break/index.tsx';
import { registerChoresModule } from './modules/chores/index.tsx';
import { registerFoodLockerModule } from './modules/food-locker/index.tsx';
import { registerBuildingAnnouncementsModule } from './modules/building-announcements/index.tsx';
import { registerAdminModule } from './modules/admin/index.tsx';

registerAuthModule();
registerUserProfileModule();
registerNotificationsModule();
registerChatModule();
registerSmokeBreakModule();
registerChoresModule();
registerFoodLockerModule();
registerBuildingAnnouncementsModule();
registerAdminModule();

function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const moduleRoutes = moduleRegistry.getRoutes();
  const guestRoutes = moduleRoutes.filter((r) => r.path === '/login' || r.path === '/register');
  const protectedRoutes = moduleRoutes.filter((r) => r.path !== '/login' && r.path !== '/register');

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestGuard />}>
          {guestRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route path="/profile" element={moduleRoutes.find((r) => r.path === '/profile')?.element} />
            <Route element={<ProfileCompleteGuard />}>
              {protectedRoutes
                .filter((r) => r.path !== '/profile')
                .map((r) => (
                  <Route key={r.path} path={r.path} element={r.element} />
                ))}
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
