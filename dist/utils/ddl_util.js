import { RolesService } from "../components/roles/role_service.js";
import { UsersService } from "../components/users/user_service.js";
import { RolesUtil } from "../components/roles/roles_controller.js";
import { v4 } from 'uuid';
import { encryptString } from "./common.js";
export class DDLUtil {
    static super_admin_role_id;
    static async addDefaultRole() {
        const service = new RolesService();
        const rights = RolesUtil.getAllPermissionsFromRights();
        const rol = {
            role_id: v4(),
            name: "SuperAdmin",
            description: "admin with all permissions ",
            rights: rights.join(','),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await service.create(rol);
        if (result.statusCode === 409) {
            const roles = await service.findAll({ name: 'superAdmin' });
            if (roles.data && roles.data.length > 0) {
                this.super_admin_role_id = roles.data[0].role_id;
            }
        }
        else if (result.statusCode === 201 && result.data) {
            this.super_admin_role_id = result.data.role_id;
            return true;
        }
        return false;
    }
    static async addDefaultUser() {
        try {
            const service = new UsersService();
            const user = {
                user_id: v4(),
                fullname: 'Super Admin',
                username: 'pms-admin',
                email: 'admin@pms.com',
                password: await encryptString('Admin@pms1'),
                role_id: this.super_admin_role_id,
                created_at: new Date(),
                updated_at: new Date()
            };
            const result = await service.create(user);
            if (result.statusCode === 201) {
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
}
