import {ProjectsService} from "../components/projects/projects_service.js"

export class ProjectsUtil {
    public static async checkValidProjectIds(ids: string[]) : Promise<boolean> {
        const service = new ProjectsService()
        const projects = (await service.findByIds(ids)).data
        return ids.every((id) => projects?.some(project => project.project_id === id))
    }
}