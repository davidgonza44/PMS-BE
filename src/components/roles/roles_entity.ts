import { Entity, JoinColumn, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Users } from '../users/users_entity.js';
import type {Relation} from "typeorm"

@Entity() 
    export class Roles {
        @PrimaryGeneratedColumn('uuid')
        role_id! : string;
        @Column({ type : 'varchar', length: 50, unique : true, nullable : false })
        name! : string
        @OneToMany(() => Users, (user : Users) => user.role)
        users!: Relation<Users[]>
        @Column({ length: 200 }) 
            description! : string
        @Column('text', {
            array : true,
            default : []
        })
            rights!: string[]
        @CreateDateColumn()
            createdAt!: Date
        @UpdateDateColumn()
            updatedAt!: Date
}
