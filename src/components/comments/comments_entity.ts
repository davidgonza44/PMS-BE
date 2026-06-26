import { Column, PrimaryGeneratedColumn, Entity, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne} from 'typeorm'
import { Users } from '../users/users_entity.js'
import { Tasks } from '../tasks/tasks_entity.js'

@Entity()
export class Comments {
    @PrimaryGeneratedColumn('uuid')
    comment_id!: string
    @Column({ type : 'varchar', nullable : false, length : 300})
    comment!: string
    @ManyToOne(() => Users, (userData) => userData.user_id)
    @JoinColumn({ name : 'user_id'})
    user_id! : Users['user_id']
    @ManyToOne(() => Tasks, (taskData) => taskData.task_id)
    @CreateDateColumn()
    created_at!: Date
    @UpdateDateColumn()
    updated_at!: Date
}