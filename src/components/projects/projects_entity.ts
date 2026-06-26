import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'

@Entity()
export class Projects {
    @PrimaryGeneratedColumn('uuid')
    project_id! : string
    @Column({length : 100, nullable: false})
    name! : string
    @Column({ type: 'varchar', length: 500})
    description! : string
    @Column('uuid', {array: true, default : []}) // usuarios asignados al proyecto
    user_ids! : string[]
    @Column()
    start_time! : Date
    @Column()
    end_time! : Date
    @CreateDateColumn()
    created_at! : Date
    @UpdateDateColumn()
    updated_at! : Date

}