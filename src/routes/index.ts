import { Application, Express } from "express";
import { CommentRoutes } from "../components/comments/comments_routes.js";
import { RoleRoutes } from "../components/roles/roles_routes.js";
import { TaskRoutes } from "../components/tasks/tasks_routes.js";
import { UserRoutes } from "../components/users/users_routes.js";
import { ProjectRoutes } from "../components/projects/projects_routes.js";
import { FileRoutes } from "../components/files/file_routes.js";

export class Routes {
    constructor(app : Application){
        const routeClasses = [
            UserRoutes,
            RoleRoutes,
            TaskRoutes,
            CommentRoutes,
            ProjectRoutes,
            FileRoutes
        ]

        for (const RouteClass of routeClasses){
            try {
                new RouteClass(app)
                console.log(`Router: ${RouteClass.name} initialized successfully`)
            } catch (error) {
                console.log(`Router: ${RouteClass.name} failed to initialize`)
            }
    }
}}