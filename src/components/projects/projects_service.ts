import {Projects} from './projects_entity.js'
import { BaseService } from "../../utils/base_service.js";
import { DatabaseUtil } from "../../utils/db.js";

export class ProjectsService extends BaseService<Projects>{
    constructor(){
        const ProjectRepository = new DatabaseUtil().getRepository(Projects)
        super(ProjectRepository)
    }
}