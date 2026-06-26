import {PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import type { Relation } from "typeorm"
import { Projects } from '../projects/projects_entity.js'
import { Users } from '../users/users_entity.js'
import { Files } from '../files/files_entity.js'

export enum Priority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export enum Status {
    NotStarted = 'Not-Started',
    InProgress = 'In-Progress',
    Completed = 'Completed'
}

@Entity()
export class Tasks {
    @PrimaryGeneratedColumn('uuid')
    task_id!: string 
    @Column({ length : 30, nullable : false, unique : true})
        name!: string
    @Column({length : 500})
        description!: string 
    @ManyToOne(() => Projects)
    @JoinColumn({ name : 'project_id'})
    project! : Projects
    @ManyToOne(() => Users)
    @JoinColumn({ name : 'user_id'})
    user! : Users
    @Column()
    estimated_start_time! : Date
    @Column()
    estimated_end_time! : Date

    @Column({ nullable: true })
    actual_start_time!: Date;

    @Column({ nullable: true })
    actual_end_time!: Date;

    @Column({
        type : 'enum',
        enum: Priority,
        default : Priority.Low
    })
    priority!: Priority
    @Column({
        type : 'enum',
        enum: Status,
        default : Status.NotStarted
    })
    status!: Status
    @OneToMany(() => Files, (file) => file.task)
    files! : Relation<Files[]>
    @CreateDateColumn()
    created_at! : Date
    @UpdateDateColumn()
    updated_at! : Date
}