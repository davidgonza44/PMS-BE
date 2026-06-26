var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Projects } from '../projects/projects_entity.js';
import { Users } from '../users/users_entity.js';
export var Priority;
(function (Priority) {
    Priority["Low"] = "Low";
    Priority["Medium"] = "Medium";
    Priority["High"] = "High";
})(Priority || (Priority = {}));
export var Status;
(function (Status) {
    Status["NotStarted"] = "Not-Started";
    Status["InProgress"] = "In-Progress";
    Status["Completed"] = "Completed";
})(Status || (Status = {}));
let Tasks = class Tasks {
    task_id;
    name;
    description;
    project_id;
    assigned_user_id;
    priority;
    status;
    supported_files;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Tasks.prototype, "task_id", void 0);
__decorate([
    Column({ length: 30, nullable: false, unique: true }),
    __metadata("design:type", String)
], Tasks.prototype, "name", void 0);
__decorate([
    Column({ length: 500 }),
    __metadata("design:type", String)
], Tasks.prototype, "description", void 0);
__decorate([
    ManyToOne(() => Projects, (projectData) => projectData.project_id),
    JoinColumn({ name: 'project_id' }),
    __metadata("design:type", Object)
], Tasks.prototype, "project_id", void 0);
__decorate([
    ManyToOne(() => Users, (usersData) => usersData.user_id),
    JoinColumn({ name: 'assigned_user_id' }),
    __metadata("design:type", Object)
], Tasks.prototype, "assigned_user_id", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: Priority,
        default: Priority.Low
    }),
    __metadata("design:type", String)
], Tasks.prototype, "priority", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: Status,
        default: Status.NotStarted
    }),
    __metadata("design:type", String)
], Tasks.prototype, "status", void 0);
__decorate([
    Column('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], Tasks.prototype, "supported_files", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Tasks.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Tasks.prototype, "updated_at", void 0);
Tasks = __decorate([
    Entity()
], Tasks);
export { Tasks };
