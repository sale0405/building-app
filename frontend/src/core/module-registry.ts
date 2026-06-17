import type { RouteObject } from 'react-router-dom';

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  adminOnly?: boolean;
}

export interface ModuleRegistration {
  routes: RouteObject[];
  navItems: NavItem[];
  onRegister?: () => void;
}

class ModuleRegistry {
  private modules: ModuleRegistration[] = [];
  private routePaths = new Set<string>();
  private navPaths = new Set<string>();

  register(reg: ModuleRegistration) {
    const routes = reg.routes.filter((route) => {
      if (!route.path || this.routePaths.has(route.path)) return false;
      this.routePaths.add(route.path);
      return true;
    });

    const navItems = reg.navItems.filter((item) => {
      if (this.navPaths.has(item.path)) return false;
      this.navPaths.add(item.path);
      return true;
    });

    if (routes.length === 0 && navItems.length === 0) return;

    this.modules.push({ routes, navItems, onRegister: reg.onRegister });
    reg.onRegister?.();
  }

  getRoutes(): RouteObject[] {
    return this.modules.flatMap((m) => m.routes);
  }

  getNavItems(isAdmin: boolean): NavItem[] {
    const seen = new Set<string>();
    const items: NavItem[] = [];

    for (const item of this.modules.flatMap((m) => m.navItems)) {
      if (item.adminOnly && !isAdmin) continue;
      if (seen.has(item.path)) continue;
      seen.add(item.path);
      items.push(item);
    }

    return items;
  }
}

export const moduleRegistry = new ModuleRegistry();
