import multer from 'multer';
import { UsersRepository } from '../repositories/users.repository.js';
import { toUserProfileDto } from '../dto/user.dto.js';
const repo = new UsersRepository();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
export class UsersController {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    getMe = async (req, res) => {
        const user = await repo.findById(req.user.id);
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: toUserProfileDto(user) });
    };
    getById = async (req, res) => {
        const user = await repo.findById(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: toUserProfileDto(user) });
    };
    list = async (req, res) => {
        const floorId = req.query.floorId;
        const users = await repo.findMany(floorId);
        res.json({ success: true, data: users.map(toUserProfileDto) });
    };
    updateMe = async (req, res) => {
        await repo.updateProfile(req.user.id, req.body);
        const user = await repo.findById(req.user.id);
        res.json({ success: true, data: user ? toUserProfileDto(user) : null });
    };
    uploadPhoto = [
        upload.single('photo'),
        async (req, res) => {
            if (!req.file)
                return res.status(400).json({ success: false, error: 'No file uploaded' });
            const key = await this.storage.save(req.file.buffer, req.file.originalname, req.file.mimetype);
            const url = this.storage.getUrl(key);
            await repo.updatePhoto(req.user.id, url);
            const user = await repo.findById(req.user.id);
            res.json({ success: true, data: user ? toUserProfileDto(user) : null });
        },
    ];
}
export function createUsersController(storage) {
    return new UsersController(storage);
}
