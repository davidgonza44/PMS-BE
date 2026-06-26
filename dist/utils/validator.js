import { validationResult } from "express-validator";
export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorsMessages = errors.array();
        return res.status(400).json({ statusCode: 400, status: "error", errors: errorsMessages });
    };
};
