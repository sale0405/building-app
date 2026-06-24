import http from 'http';
import { config } from './config/modules.js';
import { createApp } from './create-app.js';
import { initSocketGateway } from './core/socket/socket-gateway.js';

async function bootstrap() {
  const app = await createApp();
  const httpServer = http.createServer(app);
  initSocketGateway(httpServer);

  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`Server running on port ${config.port}`);
  });
}

bootstrap().catch(console.error);
