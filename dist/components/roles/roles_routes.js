import { RoleController, RolesUtil } from './roles_controller.js';
import { body } from "express-validator";
import { validate } from '../../utils/validator.js';
import { authorize } from "../../utils/auth_util.js";
const validRoleInput = [
    body('name').trim().notEmpty().withMessage('It should be required'),
    body('description').isLength({ max: 200 }).withMessage('It has a maximum limit of 200 characters'),
    body('rights').custom((value) => {
        const accessRights = value?.split(',');
        if (accessRights?.length > 0) {
            const validRights = RolesUtil.getAllPermissionsFromRights();
            const AreAllRightsValid = accessRights.every((right) => validRights.includes(right));
            if (!AreAllRightsValid) {
                throw new Error("Invalid Permission");
            }
        }
        return true;
    })
];
export class RoleRoutes {
    baseEndPoint = '/api/roles';
    constructor(app) {
        const controller = new RoleController();
        app.route(this.baseEndPoint)
            .all(authorize)
            .get(controller.getAllHandler)
            .post(validate(validRoleInput), controller.addHandler);
        app.route(`${this.baseEndPoint}/:id`)
            .all(authorize)
            .put(validate(validRoleInput), controller.updateHandler)
            .delete(controller.deleteHandler)
            .get(controller.getOneHandler);
    }
}
