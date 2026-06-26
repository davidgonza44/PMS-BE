import { CommentController } from "./comments_controller.js";
export class CommentRoutes {
    baseEndPoint = '/api/comments';
    constructor(app) {
        const controller = new CommentController();
        app.route(this.baseEndPoint)
            .get(controller.getAllHandler)
            .post(controller.addHandler);
        app.route(`${this.baseEndPoint}/:id`)
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);
    }
}
