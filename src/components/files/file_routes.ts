import { authorize } from "../../utils/auth_util.js";
import { Express, Application } from "express";
import { fileUploadMiddleware } from "../../utils/multer.js";
import { FileController } from "./files_controller.js";
import {body} from "express-validator"
import { validate } from "../../utils/validator.js";

const validFile = [
    body("task_id").notEmpty().isUUID().withMessage("task_id must be an UUID")
]


export class FileRoutes{
    private baseEndPoint = '/api/files'
    constructor(app: Application){
        const controller = new FileController()
        app.route(this.baseEndPoint)
        .all(authorize)
        .post(fileUploadMiddleware, validate(validFile), controller.addHandler)
        app.route(`${this.baseEndPoint}/:id`)
        .all(authorize)
        .get(controller.getOneHandler)
    }
}