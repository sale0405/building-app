import type { Response } from 'express';
import multer from 'multer';
import { UsersRepository } from '../repositories/users.repository.js';
import { toUserProfileDto } from '../dto/user.dto.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';
import type { StorageService } from '../../../core/storage/storage.interface.js';

const repo = new UsersRepository();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export class UsersController {
  constructor(private storage: StorageService) {}

  getMe = async (req: AuthenticatedRequest, res: Response) => {
    const user = await repo.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: toUserProfileDto(user) });
  };

  getById = async (req: AuthenticatedRequest, res: Response) => {
    const user = await repo.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: toUserProfileDto(user) });
  };

  list = async (req: AuthenticatedRequest, res: Response) => {
    const floorId = req.query.floorId as string | undefined;
    const users = await repo.findMany(floorId);
    res.json({ success: true, data: users.map(toUserProfileDto) });
  };

  updateMe = async (req: AuthenticatedRequest, res: Response) => {
    await repo.updateProfile(req.user!.id, req.body);
    const user = await repo.findById(req.user!.id);
    res.json({ success: true, data: user ? toUserProfileDto(user) : null });
  };

  uploadPhoto = [
    upload.single('photo'),
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
      const key = await this.storage.save(req.file.buffer, req.file.originalname, req.file.mimetype);
      const url = this.storage.getUrl(key);
      await repo.updatePhoto(req.user!.id, url);
      const user = await repo.findById(req.user!.id);
      res.json({ success: true, data: user ? toUserProfileDto(user) : null });
    },
  ];
}

export function createUsersController(storage: StorageService) {
  return new UsersController(storage);
}
