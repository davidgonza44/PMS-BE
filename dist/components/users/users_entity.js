var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Roles } from '../roles/roles_entity.js';
let Users = class Users {
    user_id;
    fullname;
    username;
    email;
    password;
    role_id;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Users.prototype, "user_id", void 0);
__decorate([
    Column({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Users.prototype, "fullname", void 0);
__decorate([
    Column({ length: 30, nullable: false, unique: true }),
    __metadata("design:type", String)
], Users.prototype, "username", void 0);
__decorate([
    Column({ length: 60, nullable: false, unique: true }),
    __metadata("design:type", String)
], Users.prototype, "email", void 0);
__decorate([
    Column({ select: false, nullable: false }),
    __metadata("design:type", String)
], Users.prototype, "password", void 0);
__decorate([
    OneToOne(() => Roles, (roleData) => roleData.role_id),
    JoinColumn({ name: 'role_id' }),
    __metadata("design:type", Object)
], Users.prototype, "role_id", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Users.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Users.prototype, "updated_at", void 0);
Users = __decorate([
    Entity()
], Users);
export { Users };
