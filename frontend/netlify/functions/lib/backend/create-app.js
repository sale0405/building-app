import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { config } from './config/modules.js';
import { eventBus } from './core/events/event-bus.js';
import { LocalStorageService } from './core/storage/local-storage.service.js';
import { registerModules } from './core/app.js';
function resolveStoragePath() {
    if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        return '/tmp/uploads';
    }
    return config.storage.path;
}
export async function createApp() {
    const app = express();
    const httpServer = http.createServer(app);
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(cors({ origin: config.corsOrigin, credentials: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    const storage = new LocalStorageService(resolveStoragePath());
    await storage.ensureDir();
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.get('/api/v1/storage/:key', (req, res) => {
        const filePath = storage.getPath(req.params.key);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ success: false, error: 'File not found' });
            return;
        }
        res.sendFile(path.resolve(filePath));
    });
    await registerModules(app, { eventBus, storage }, httpServer);
    return app;
}
