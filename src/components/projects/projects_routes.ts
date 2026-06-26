import { ProjectController } from "./projects_controller.js";
import { Application } from "express";
import {authorize} from '../../utils/auth_util.js'
import { validate } from "../../utils/validator.js";
import { checkValidDate } from "../../utils/common.js";
import { body } from "express-validator";

const validProjectInput = [
    body('name').trim().notEmpty().withMessage('El nombre del proyecto es requerido'),
    body('description').trim().notEmpty().withMessage('La descripción del proyecto es requerida'),
    body('user_ids').isArray().withMessage('Los IDs de usuario deben ser un arreglo'),
    body('start_time').custom((value) => {
        if (!checkValidDate(value)) {
            throw new Error("La fecha de inicio no es válida. Formato esperado: YYYY-MM-DD");
        }

        const date = new Date(value); //verifica que se pueda convertir a fecha
        if (isNaN(date.getTime())) {
            throw new Error("La fecha de inicio no es válida. Formato esperado: YYYY-MM-DD");
        }
        return true;
    }),
    body('end_time').custom((value, {req}) => {
        if (!checkValidDate(value)) {
            throw new Error("La fecha de fin no es válida. Formato esperado: YYYY-MM-DD");
        }

        const endDate = new Date(value); //verifica que se pueda convertir a fecha
        if (isNaN(endDate.getTime())) {
            throw new Error("La fecha de fin no es válida. Formato esperado: YYYY-MM-DD");
        }

        const startDate = new Date(req.body.start_time);
        if (endDate < startDate) {
            throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        return true;
    }   )
]

export class ProjectRoutes {
    private baseEndPoint = '/api/projects'
    constructor(app : Application){
        const controller = new ProjectController()
        app.route(this.baseEndPoint)
        .all(authorize) //antes de que llegue cualquier tipo de peticion ejecuta este middleware authorize
        .get(controller.getAllHandler)
        .post(validate(validProjectInput), controller.addHandler)
        app.route(`${this.baseEndPoint}/:id`)
        .all(authorize)
        .put(controller.updateHandler)
        .delete(controller.deleteHandler)
        .get(controller.getOneHandler)
    }
}