import { Application } from "express";
import { CommentController } from "./comments_controller.js";

export class CommentRoutes {
    private baseEndPoint = '/api/comments'
    constructor(app : Application){
        const controller = new CommentController()
        app.route(this.baseEndPoint)
        .get(controller.getAllHandler)
        .post(controller.addHandler)
        app.route(`${this.baseEndPoint}/:id`)
        .get(controller.getDetailsHandler)
        .put(controller.updateHandler)
        .delete(controller.deleteHandler)
    }
}