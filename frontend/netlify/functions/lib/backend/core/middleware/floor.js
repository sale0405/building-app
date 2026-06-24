export function resolveFloorContext(req, res, next) {
    const floorId = req.query.floorId || req.body?.floorId || req.user?.floorId;
    if (!floorId) {
        res.status(400).json({ success: false, error: 'Floor context required' });
        return;
    }
    req.body = { ...req.body, _floorId: floorId };
    next();
}
export function getFloorId(req) {
    return req.query.floorId || req.body?._floorId || req.user?.floorId;
}
