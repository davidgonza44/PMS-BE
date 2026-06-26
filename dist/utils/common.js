import * as bcrypt from 'bcrypt';
const salt = 8;
import { RolesService } from '../components/roles/role_service.js';
export const Rights = {
    ROLES: {
        ADD: 'add_role',
        EDIT: 'edit_role',
        GET_ALL: 'get_all_roles',
        GET_DETAILS: 'get_details_role',
        DELETE: 'delete_role',
        ALL: 'add_role,edit_role,get_all_roles,get_details_role,delete_role'
    },
    USERS: {
        ADD: 'add_user',
        EDIT: 'edit_user',
        GET_ALL: 'get_all_users',
        GET_DETAILS: 'get_details_user',
        DELETE: 'delete_user',
        ALL: 'add_user,edit_user,get_all_users,get_details_user,delete_user'
    },
    PROJECTS: {
        ADD: 'add_project',
        EDIT: 'edit_project',
        GET_ALL: 'get_all_projects',
        GET_DETAILS: 'get_details_project',
        DELETE: 'delete_project',
        ALL: 'add_project,edit_project,get_all_projects,get_details_project,delete_project'
    },
    TASKS: {
        ADD: 'add_task',
        EDIT: 'edit_task',
        GET_ALL: 'get_all_tasks',
        GET_DETAILS: 'get_details_task',
        DELETE: 'delete_task',
        ALL: 'add_task,edit_task,get_all_tasks,get_details_task,delete_task'
    },
    COMMENTS: {
        ADD: 'add_comment',
        EDIT: 'edit_comment',
        GET_ALL: 'get_all_comments',
        GET_DETAILS: 'get_details_comment',
        DELETE: 'delete_comment',
        ALL: 'add_comment,edit_comment,get_all_comments,get_details_comment,delete_comment'
    }
};
export const SERVER_CONST = {
    JWT_SECRET: process.env.JWT_SECRET || '',
    ACCESS_TOKEN_EXPIRY: Number(process.env.ACCESS_TOKEN_EXPIRY) || 28800,
    REFRESH_TOKEN_EXPIRY: Number(process.env.REFRESH_TOKEN_EXPIRY) || 3024000
};
export const encryptString = async (text) => {
    const hashedPassword = await bcrypt.hash(text, salt);
    return hashedPassword;
};
export const bcryptCompare = async (text, hash) => {
    return await bcrypt.compare(text, hash);
};
export const checkValidRoleIds = async (roleIds) => {
    const service = new RolesService();
    const valid_roles = await service.findByIds(roleIds);
    if (valid_roles.status === 'success' && roleIds.length === valid_roles?.data?.length) {
        return true;
    }
    return false;
};
