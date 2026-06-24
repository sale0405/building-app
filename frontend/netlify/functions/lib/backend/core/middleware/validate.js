export function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
export function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: result.error.errors.map((e) => e.message).join(', '),
            });
            return;
        }
        req.query = result.data;
        next();
    };
}
