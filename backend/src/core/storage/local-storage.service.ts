import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface StorageService {
  save(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  getUrl(storageKey: string): string;
  delete(storageKey: string): Promise<void>;
  getPath(storageKey: string): string;
}

export class LocalStorageService implements StorageService {
  constructor(private basePath: string) {}

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
  }

  async save(file: Buffer, fileName: string, _mimeType: string): Promise<string> {
    await this.ensureDir();
    const ext = path.extname(fileName);
    const storageKey = `${randomUUID()}${ext}`;
    const fullPath = path.join(this.basePath, storageKey);
    await fs.writeFile(fullPath, file);
    return storageKey;
  }

  getUrl(storageKey: string): string {
    return `/api/v1/storage/${storageKey}`;
  }

  getPath(storageKey: string): string {
    return path.join(this.basePath, storageKey);
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await fs.unlink(this.getPath(storageKey));
    } catch {
      // file may not exist
    }
  }
}
