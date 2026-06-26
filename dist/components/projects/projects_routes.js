import { ProjectController } from "./projects_controller.js";
export class ProjectRoutes {
    baseEndPoint = '/api/projects';
    constructor(app) {
        const controller = new ProjectController();
        app.route(this.baseEndPoint)
            .get(controller.getAllHandler)
            .post(controller.addHandler);
        app.route(`${this.baseEndPoint}/:id`)
            .put(controller.updateHandler)
            .delete(controller.deleteHandler)
            .get(controller.getDetailsHandler);
    }
}
