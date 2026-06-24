import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
export class LocalStorageService {
    basePath;
    constructor(basePath) {
        this.basePath = basePath;
    }
    async ensureDir() {
        await fs.mkdir(this.basePath, { recursive: true });
    }
    async save(file, fileName, _mimeType) {
        await this.ensureDir();
        const ext = path.extname(fileName);
        const storageKey = `${randomUUID()}${ext}`;
        const fullPath = path.join(this.basePath, storageKey);
        await fs.writeFile(fullPath, file);
        return storageKey;
    }
    getUrl(storageKey) {
        return `/api/v1/storage/${storageKey}`;
    }
    getPath(storageKey) {
        return path.join(this.basePath, storageKey);
    }
    async delete(storageKey) {
        try {
            await fs.unlink(this.getPath(storageKey));
        }
        catch {
            // file may not exist
        }
    }
}
