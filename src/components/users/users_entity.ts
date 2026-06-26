import {PrimaryGeneratedColumn, JoinColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne} from 'typeorm'
import { Roles } from '../roles/roles_entity.js';
import type {Relation} from "typeorm"

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    user_id!: string;

    @Column({ length: 50, nullable: true })
    fullname!: string;

    @Column({ length: 30, nullable: false, unique: true })
    username!: string;

    @Column({ length: 60, nullable: false, unique: true })
    email!: string;

    @Column({select : false, nullable: false })
    password!: string;


    @ManyToOne(() => Roles, (role : Roles) => role.users )
    @JoinColumn({name : "role_id"})
    role!: Relation<Roles>;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
