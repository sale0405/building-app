import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { ChatPage } from './pages/ChatPage.js';

export function registerChatModule() {
  moduleRegistry.register({
    routes: [{ path: '/chat', element: <ChatPage /> }],
    navItems: [{ label: t('nav.chat'), path: '/chat' }],
  });
}

