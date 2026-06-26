import { encryptString } from "../../utils/common.js";
import { checkValidRoleIds } from "../../utils/common.js";
import { UsersService } from "./user_service.js";
import { bcryptCompare, SERVER_CONST } from "../../utils/common.js";
import jwt from 'jsonwebtoken';
import { hasPermission } from "../../utils/auth_util.js";
export class UserController {
    async addHandler(req, res) {
        if (!hasPermission(req.user?.rights ?? [], 'add_user')) {
            res.status(403).json({
                statusCode: 403,
                status: "error",
                message: "Unathorized"
            });
            return;
        }
        try {
            const user = req.body;
            user.password = await encryptString(user.password);
            const isIdsExist = await checkValidRoleIds(user.role_ids);
            if (!isIdsExist) {
                res.status(400).json({ message: 'One or more role_ids are invalid' });
                return;
            }
            const service = new UsersService();
            user.email = user.email.toLowerCase();
            user.fullname = user.fullname.toLowerCase();
            user.role_id = user.role_ids[0];
            delete user.role_ids;
            const response = await service.create(user);
            res.status(201).json(response);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAllHandler(req, res) {
        if (!hasPermission(req.user?.rights ?? [], "get_all_users")) {
            res.status(403).json({
                statusCode: 403,
                status: "error",
                message: "Unauthorized"
            });
            return;
        }
        const service = new UsersService();
        const result = await service.findAll(req.query);
        res.status(result.statusCode).json(result);
        return;
    }
    async getDetailsHandler(req, res) {
        if (!hasPermission(req.user?.rights ?? [], "get_details_users")) {
            res.status(403).json({
                statusCode: 403, status: "error", message: "Unauthorized"
            });
            return;
        }
        const service = new UsersService();
        const result = await service.findOne(req.params.id);
        res.status(result.statusCode).json(result);
    }
    async updateHandler(req, res) {
        if (!hasPermission(req.user?.rights ?? [], "edit_user")) {
            res.status(403).json({
                statusCode: 403,
                status: "error",
                message: "unathorized"
            });
            return;
        }
    }
    async deleteHandler(req, res) {
        if (!hasPermission(req.user?.rights ?? [], "delete_user")) {
            res.status(403).json({
                statusCode: 403, status: "error", message: "Unauthorized"
            });
        }
    }
    async login(req, res) {
        const { email, password } = req.body;
        const service = new UsersService();
        const user = await service.findByEmailWithPassword(email);
        if (!user) {
            res.status(401).json({
                statusCode: 401,
                status: "error",
                message: "Invalid email or password"
            });
            return;
        }
        const hash = user.password;
        const isSame = await bcryptCompare(password, hash);
        if (!isSame) {
            res.status(401).json({
                statusCode: 401,
                status: "error",
                message: "Invalid email or password"
            });
            return;
        }
        const access_token = jwt.sign({sub: user.user_id, email: email, username: user.username }, SERVER_CONST.JWT_SECRET, { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY
        });
        const refresh_token = jwt.sign({sub: user.user_id, email: email, username: user.username }, SERVER_CONST.JWT_SECRET, { expiresIn: SERVER_CONST.REFRESH_TOKEN_EXPIRY
        });
        res.status(200).json({ statusCode: 200, status: "success", data: {
                access_token,
                refresh_token
            } });
        return;
    }
    async getAccessTokenFromRefreshToken(req, res) {
        const { refresh_token } = req.body;
        jwt.verify(refresh_token, SERVER_CONST.JWT_SECRET, (err, user) => {
            if (err) {
                res.status(403).json({
                    statusCode: '403',
                    status: "error",
                    message: "Invalid refresh token"
                });
                return;
            }
            const access_token = jwt.sign(user, SERVER_CONST.JWT_SECRET, { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY });
            res.status(200).json({ statusCode: 200, status: "success", data: { access_token } });
            return;
        });
    }
}
export class UsersUtil {
    static async getUserFromUsername(username) {
        try {
            if (username) {
                const service = new UsersService();
                const users = await service.customQuery("entity.username = :username", { username });
                if (users && users.length > 0) {
                    return users[0];
                }
            }
        }
        catch (error) {
            console.error(`error while getUser from token : ${error}`);
        }
        return null;
    }
}
