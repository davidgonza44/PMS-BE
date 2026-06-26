import { UUID } from "node:crypto";
import { Entity, 
        PrimaryGeneratedColumn, 
        Column, 
        CreateDateColumn, 
        UpdateDateColumn, 
        ManyToOne,
        JoinColumn,
    } 
from "typeorm";

import type { Relation } from "typeorm"
import { Tasks } from "../tasks/tasks_entity.js";
import { Users } from "../users/users_entity.js";

@Entity()
export class Files{
    @PrimaryGeneratedColumn('uuid')
    file_id! : string
    @Column({length : 255, nullable: false, unique: true})
    file_name! : string
    @Column({length: 30})
    mime_type!: string
    @ManyToOne(() => Tasks)
    @JoinColumn({name : 'task_id'})
    task! : Relation<Tasks>
    @ManyToOne(() => Users)
    @JoinColumn({name : 'user_id'})
    user!: Users
    @CreateDateColumn()
    created_at!: Date
    @UpdateDateColumn()
    updated_at!: Date
}