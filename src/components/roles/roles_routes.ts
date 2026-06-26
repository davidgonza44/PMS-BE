import { Application} from 'express'
import { RoleController } from './roles_controller.js'
import { body, param } from "express-validator"
import { validate } from '../../utils/validator.js'
import { authorize } from "../../utils/auth_util.js"
import { RolesUtil } from "../../utils/roles_utils.js"

const AllValidPermissions = RolesUtil.getAllPermissionsFromRights()

const validRoleInput = [
    body('name').trim()
        .notEmpty()
        .withMessage('Role name is required')
        .bail()
        .isLength({max: 50})
        .withMessage('Role name shoud have a maximum of 50 characters'),

    body('description')
        .notEmpty()
        .withMessage("Description can't be empty")
        .bail()
        .isLength({ max : 200})
        .withMessage('It has a maximum limit of 200 characters'),

    body('rights')
        .isArray({min : 1})
        .withMessage("Rights must be a not empty array"),

    body("rights.*")
        .isString()
        .withMessage("All permissions must be strings")
        .bail()

        .isIn(AllValidPermissions)
        .withMessage("One or more permissions are invalid"),
]

const validRoleId = [
    param("id")
        .optional()
        .isUUID()
        .withMessage('Param must be an uuid')
]


export class RoleRoutes {
    private baseEndPoint = '/api/roles'
    constructor(app : Application){
        const controller = new RoleController()
        app.route(this.baseEndPoint)
        .all(authorize)
        .get(controller.getAllHandler)
        .post(validate(validRoleInput) , controller.addHandler)
        app.route(`${this.baseEndPoint}/:id`)
        .all(authorize, validate(validRoleId))
        .put(controller.updateHandler) // primero valida que los dat env sean correc si pasan ej el controlador
        .delete(controller.deleteHandler)
        .get(controller.getOneHandler)
        
    }
}