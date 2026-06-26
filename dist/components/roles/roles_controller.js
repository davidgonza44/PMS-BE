import { Rights } from "../../utils/common.js";
import { RolesService } from "./role_service.js";
import { BaseController } from "../../utils/base_controller.js";
import { hasPermission } from "../../utils/auth.js" ;
export class RoleController extends BaseController {
    async addHandler(req, res) {
        if (!hasPermission(req.user.rights, "add_role")) {
            res.status(403).json({
                statusCode: 403, status: "error", message: "Unauthorized"
            });
            return;
        }
        const role = req.body;
        const service = new RolesService();
        const result = await service.create(role);
        res.status(result.statusCode).json(result);
        return;
    }
    async getAllHandler(req, res) {
        if (!hasPermission(req.user.rights, "add_role")) {
            res.status(403).json({
                statusCode: 403, status: error, message: "Unauthorized"
            });
            return;
        }
        const query = req.query;
        const service = new RolesService();
        const result = await service.findAll(query);
        res.status(result.statusCode).json(result);
        return;
    }
    async getOneHandler(req, res) {
        if (!hasPermission(req.user.rights, "get_details_role")) {
            res.status(403).json({
                statusCode: 403, status: error, message: "Unauthorized"
            });
            return;
        }
        const id = req.params.id;
        const service = new RolesService();
        const result = await service.findOne(id);
        if (!result) {
            res.status(404).json({ message: 'role not found' });
            return;
        }
        res.status(result.statusCode).json(result);
    }
    async updateHandler(req, res) {
        if (!hasPermission(req.user.rights, "edit_role")) {
            res.status(403).json({
                statusCode: 403, status: "error", message: "Unauthorized"
            });
            return;
        }
        const role = req.body;
        const id = req.params.id;
        const service = new RolesService();
        const result = await service.update(id, role);
        if (!result) {
            res.status(404).json({ message: 'role not found' });
            return;
        }
        res.status(result.statusCode).json(result);
    }
    async deleteHandler(req, res) {
        if (!hasPermission(req.user.rights, "delete_role")) {
            res.status(403).json({
                statusCode: 403, status: "error", message: "Unauthorized"
            });
            return;
        }
        const id = req.params.id;
        const service = new RolesService();
        const result = await service.delete(id);
        if (!result) {
            res.status(404).json({ message: 'role not found' });
            return;
        }
        res.status(result.statusCode).json(result);
    }
}
export class RolesUtil {
    static getAllPermissionsFromRights() {
        let permissions = [];
        for (const module in Rights) {
            if (Rights[module]['ALL']) {
                let sectionValues = Rights[module]['ALL'];
                sectionValues = sectionValues.split(',');
                permissions = [...permissions, ...sectionValues];
            }
        }
        return permissions;
    }
    static async getAllRightsFromRoles(role_ids) {
        const service = new RolesService();
        const roles = (await service.findByIds(role_ids)).data ?? [];
        let rights = [];
        for (const rol of roles) {
            const rightsFromRole = rol.rights.split(',');
            rights = [...new Set([...rights, ...rightsFromRole])];
        }
        return rights;
    }
}
