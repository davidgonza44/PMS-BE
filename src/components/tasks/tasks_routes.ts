import { Application } from "express";
import { TaskController } from "./tasks_controller.js";
import { body, query } from "express-validator";
import { validate } from "../../utils/validator.js";
import { checkValidDate } from "../../utils/common.js";
import { authorize } from "../../utils/auth_util.js";


const validTaskInput = [
    body('name').trim().notEmpty().withMessage('El nombre de la tarea es requerido'),
    body('description').trim().notEmpty().withMessage('La descripción de la tarea es requerida'),
    body('project_id').notEmpty().isUUID().withMessage('El ID del proyecto es requerido'),
    body('user_id').notEmpty().isUUID().withMessage('El ID del usuario asignado es requerido'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('La prioridad debe ser Low, Medium o High'),
    body('status').optional().isIn(['Not-Started', 'In-Progress', 'Completed']).withMessage('El estado debe ser Not-Started, In-Progress o Completed'),
    body('estimated_start_time').trim().notEmpty().withMessage('La fecha de inicio estimada es requerida'),
    body('estimated_end_time').trim().notEmpty().withMessage('La fecha de fin estimada es requerida'),
    body('estimated_start_time').custom((value, {req}) => {
        if (!checkValidDate(value)){
            throw new Error('La fecha de inicio estimada no es válida. Formato esperado: YYYY-MM-DD HH:mm:ss')
        }
        value = new Date(value)
        if (isNaN(value.getTime())){
            throw new Error('La fecha de inicio estimada no es válida. Formato esperado: YYYY-MM-DD HH:mm:ss')
        }

        const currentTime = new Date()
        if (currentTime > value){
            throw new Error('La fecha de inicio estimada no puede ser anterior a la fecha actual')
        }

        if (value > new Date(req.body.estimated_end_time)){
            throw new Error('La fecha de inicio estimada no puede ser posterior a la fecha de fin estimada')
        }

        return true
    }),
    body('estimated_end_time').custom((value, {req}) => {
        if (!checkValidDate(value)){
            throw new Error('La fecha de fin estimada no es válida. Formato esperado: YYYY-MM-DD HH:mm:ss')
        }

        const endTime = new Date(value)
        if (isNaN(endTime.getTime())){
            throw new Error('La fecha de fin estimada no es válida. Formato esperado: YYYY-MM-DD HH:mm:ss')
        }

        if (endTime < new Date(req.body.estimated_start_time)){
            throw new Error('La fecha de fin estimada no puede ser anterior a la fecha de inicio estimada')
        }

        return true
    })
]

const validUpdateTaskInput = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("El nombre de la tarea no puede estar vacio"),
    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("La descripcion de la tarea no puede estar vacia"),
    body("user_id")
        .optional()
        .isUUID()
        .withMessage("Debe ser un uuid"),
    body("project_id")
        .optional()
        .isUUID()
        .withMessage("Debe ser un UUID"),
    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High"])
        .withMessage("La prioridad debe ser Low, Medium o High"),
    body("status")
        .optional()
        .isIn(["Not-Started", "In-Progress", "Completed"])
        .withMessage("El estado debe ser Not-Started, In-Progress o Completed"),
    body("estimated_start_time")
        .optional()
        .custom((value, {req}) => {
            const estimated_start_time_date = new Date(value)
            const estimated_end_time_date = new Date(req.body.estimated_end_time)
            const current_time_date = new Date()

            if (!checkValidDate(value) || isNaN(estimated_start_time_date.getTime())){
                throw new Error("Fecha no valida, Formato esperado: YYYY-MM-DD HH:mm:ss")
            }

            if (estimated_end_time_date && (estimated_end_time_date < estimated_start_time_date || estimated_end_time_date < current_time_date )){
                throw new Error("Fecha no valida debe ser posterior a la fecha de inicio y posterior a la fecha actual")
            }
            return true

        }),
    body("estimated_end_time")
        .optional()
        .custom((value, {req}) => {
            if (!checkValidDate(value)){
                throw new Error("Fecha no valida Formato esperado: YYYY-MM-DD HH:mm:ss")
            }

            const estimated_end_time_date = new Date(value)
            const currentTime = new Date()
            const estimated_start_time_date = new Date(req.body.estimated_start_time)

            if (isNaN(estimated_end_time_date.getTime())){
                throw new Error("Invalid Date Formato esperado: YYYY-MM-DD HH:mm:ss")
            }
            if (estimated_end_time_date < currentTime){
                throw new Error("The estimated end time must be a valid date, not from the past. ")
            }

            if (req.body.estimated_start_time && estimated_end_time_date < estimated_start_time_date){
                throw new Error("La fecha de fin estimada no puede ser anterior anterior a la fecha de inicio estimada")
            }
            return true
        })
        
]

const validTaskFilters = [
    query("status").optional().isIn(["Not-Started", "In-Progress", "Complete"]),
    query("project_id").optional().isUUID(),
    query("user_id").optional().isUUID(),
    query("priority").optional().isIn(["Low, Medium, High"])
]

export class TaskRoutes {
    private baseEndPoint = '/api/tasks'
    constructor(app : Application){
        const controller = new TaskController()
        
        app.route(this.baseEndPoint)
        .all(authorize)
        .get(validate(validTaskFilters), controller.getAllHandler)
        .post(validate(validTaskInput), controller.addHandler)
        app.route(`${this.baseEndPoint}/:id`)
        .all(authorize)
        .get(validate(validTaskFilters), controller.getOneHandler)
        .put(validate(validUpdateTaskInput), controller.updateHandler)
        .delete(controller.deleteHandler)
    }
}