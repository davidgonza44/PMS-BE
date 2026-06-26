import { Application } from "express";
import { UserController } from "./users_controller.js";
import { body, param } from "express-validator";
import { validate } from "../../utils/validator.js";
import { authorize } from "../../utils/auth_util.js";

const validUserInput = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({min : 6, max : 12}).withMessage('Password is required')
    .isStrongPassword({minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage('Password must have one Lowercase, one uppercase,one number and one symbol'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role_id').isUUID().withMessage('At least one role is required')
    .custom((value : string) => {
            const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            const isValid = uuidPattern.test(value)
            if (!isValid){
                throw new Error('Invalid role_id format')
            }
            return true
    })
]

const updateValidUserInput = [
    body('role_id')
        .optional()
        .custom((value : string) => { 
            const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            const isValid =  uuidPattern.test(value)
            if (!isValid){
                throw new Error('It has invalid uuids for role')
            
        }
        return true
    })
]

const validChangePassword = [
    body('oldPassword').trim().notEmpty().withMessage("It should be required"),
    body('newPassword')
    .isLength({min: 6, max: 12})
    .isStrongPassword({
        minLowercase : 1,
        minSymbols : 1,
        minUppercase : 1,
        minNumbers: 1
    })
    .withMessage('It should include at least one uppercase letter, one lowecase letter, one number and one symbol'),
]

export class UserRoutes {
    private baseEndPoint = '/api/users'
    constructor(app : Application){
        const controller = new UserController()
        app.route(this.baseEndPoint)
        .all(authorize) //antes de que llegue cualquier tipo de peticion ejecuta este middleware authorize
        .get(controller.getAllHandler)
        .post(validate(validUserInput),controller.addHandler)
        app.route(this.baseEndPoint + '/changePassword/:id')
        .all(authorize)
        .patch(validate(validChangePassword), controller.changePassword)
        app.route(`${this.baseEndPoint}/:id`)
        .all(authorize)
        .put(validate(updateValidUserInput),controller.updateHandler)
        .delete(controller.deleteHandler)
        .get(controller.getOneHandler)
        app.route('/api/auth/login')
        .post(controller.login)
        app.route('/api/refresh_token')
        .post(controller.getAccessTokenFromRefreshToken)
        app.route('/api/forgot_password')
        .post(controller.forgotPassword)
    }
}

// Asignar roles a VARIOS usuarios al mismo tiempo
// body('role_ids') = ["abc-123", "def-456", "ghi-789"]
//                  ↑ los ids de los usuarios a los que les asignas un rol

// O buscar usuarios que tengan ciertos roles
// GET /users?role_ids=["abc-123", "def-456"]