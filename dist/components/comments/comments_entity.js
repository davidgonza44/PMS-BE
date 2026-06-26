var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from '../users/users_entity.js';
import { Tasks } from '../tasks/tasks_entity.js';
let Comments = class Comments {
    comment_id;
    comment;
    user_id;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Comments.prototype, "comment_id", void 0);
__decorate([
    Column({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], Comments.prototype, "comment", void 0);
__decorate([
    ManyToOne(() => Users, (userData) => userData.user_id),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], Comments.prototype, "user_id", void 0);
__decorate([
    ManyToOne(() => Tasks, (taskData) => taskData.task_id),
    CreateDateColumn(),
    __metadata("design:type", Date)
], Comments.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Comments.prototype, "updated_at", void 0);
Comments = __decorate([
    Entity()
], Comments);
export { Comments };
