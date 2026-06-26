import { TaskController } from "./tasks_controller.js";
export class TaskRoutes {
    baseEndPoint = '/api/tasks';
    constructor(app) {
        const controller = new TaskController();
        app.route(this.baseEndPoint)
            .get(controller.getAllHandler)
            .post(controller.addHandler);
        app.route(`${this.baseEndPoint}/:id`)
            .get(controller.getDetailsHandler)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler);
    }
}
