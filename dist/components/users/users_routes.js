import { UserController } from "./users_controller.js";
import { body } from "express-validator";
import { validate } from "../../utils/validator.js";
import { authorize } from "../../utils/auth_util.js";
const validUserInput = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6, max: 12 }).withMessage('Password is required')
        .isStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }).withMessage('Password must have one Lowercase, one uppercase,one number and one symbol'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role_ids').isArray({ min: 1 }).withMessage('At least one role is required')
        .custom((value) => {
        if (value.length > 0 && value instanceof Array) {
            const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            const isValid = value.every(id => uuidPattern.test(id));
            if (!isValid) {
                throw new Error('Invalid role_id format');
            }
            return true;
        }
    })
];
export class UserRoutes {
    baseEndPoint = '/api/users';
    constructor(app) {
        const controller = new UserController();
        app.route(this.baseEndPoint)
            .all(authorize)
            .get(controller.getAllHandler)
            .post(validate(validUserInput), controller.addHandler);
        app.route(`${this.baseEndPoint}/:id`)
            .all(authorize)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler)
            .get(controller.getDetailsHandler);
        app.route('/api/login')
            .post(controller.login);
        app.route('/api/refresh_token')
            .post(controller.getAccessTokenFromRefreshToken);
    }
}
