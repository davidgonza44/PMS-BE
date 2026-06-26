import { SERVER_CONST } from "../utils/common.js";
import jwt from 'jsonwebtoken';
export const authorize = async (req, res, next) => {
    const token = req.headers?.authorization ? req.headers.authorization.split('Bearer ')[1] : null;
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, SERVER_CONST.JWT_SECRET);
        req.user = {};
        req.user.user_id = decoded['user_id'] ?? '';
        req.user.email = decoded['email'] ?? '';
        req.user.username = decoded['username'] ?? '';
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        return res.status(401).json({ statusCode: 401, status: 'error', message: 'Invalid Token' });
    }
};
export const hasPermission = (rights, desired_rights) => {
    if (rights.includes(desired_rights)) {
        return true;
    }
    return false;
};
