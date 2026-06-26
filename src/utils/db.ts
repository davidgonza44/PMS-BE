import { DataSource, ObjectLiteral } from 'typeorm'
import { IServerConfig} from './config.js'
import { Projects } from '../components/projects/projects_entity.js'
import { Tasks } from '../components/tasks/tasks_entity.js'
import { Users } from '../components/users/users_entity.js'
import { Comments } from '../components/comments/comments_entity.js'
import { Repository } from 'typeorm'
import { EntityTarget } from 'typeorm'
import { Roles } from '../components/roles/roles_entity.js'
import { Files } from '../components/files/files_entity.js'

export class DatabaseUtil { // administrador de conexiones DatabaseUtilAnfitrión / mesero
    private static connection : DataSource | null = null
    private static instance: DatabaseUtil | null // un solo administrador
    private static connectingPromise: Promise<DataSource> | null = null
    private repositories : Record<string, Repository<any>> = {} // guarda {} en la propiedad repositores del objeto actual
    constructor() {
        this.connectDatabase()
    }

    private async connectDatabase(): Promise<DataSource>{ // cada connectDatbase levanta su propio pool de 10 conexiones
        if (DatabaseUtil.connection?.isInitialized){
            return DatabaseUtil.connection
        }

        if (DatabaseUtil.connectingPromise) {
            return DatabaseUtil.connectingPromise
        }

        DatabaseUtil.connectingPromise = (async () => {
            try {
                const AppDataSource = new DataSource({
                    type: 'postgres',
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    entities: [Projects, Tasks, Users, Comments, Roles, Files],
                    poolSize: 10,
                    synchronize: true,
                    logging: false
                })

                await AppDataSource.initialize()
                DatabaseUtil.connection = AppDataSource
                console.log('connected to the database')
                return AppDataSource

            } catch (error) {
                console.error('Error connecting to the database', error)
                DatabaseUtil.connectingPromise = null  // si falló, deja reintentar después
                throw error
            }
        })()

        return DatabaseUtil.connectingPromise

    }

    public static async getInstance() : Promise<DatabaseUtil> { // un solo punto de entrada para crear conectar y devolver
        if (!DatabaseUtil.instance){
            DatabaseUtil.instance = new DatabaseUtil() // aqui simplemente se crea la instancia de la clase DatabaseUtil {} el administrador
        }
        await DatabaseUtil.instance.connectDatabase() // al conectarme a la bd me devuelve la conexion
        return DatabaseUtil.instance
    }

    public getRepository<T extends ObjectLiteral>(entity : EntityTarget<T>) : Repository<T>{ // entregar los respositories (tablas) para que otros hagan las consultas
        if (!DatabaseUtil.connection){
            throw new Error("Database not connected")
        }
        const entityName = (entity as Function).name
        if (!this.repositories[entityName]){
            this.repositories[entityName] = DatabaseUtil.connection.getRepository(entity)
        }
        return this.repositories[entityName]
    }

    public static async closeConnection(){
        if (DatabaseUtil.connection?.isInitialized){
            await DatabaseUtil.connection.destroy()
            DatabaseUtil.connection = null
            DatabaseUtil.connectingPromise = null
            DatabaseUtil.instance = null
        }
    }
}

// como se ve instance por dentro

// DatabaseUtil.instance = {
//   dataSource: DataSource {
//     options: { type: "postgres", host: "...", ... },
//     isInitialized: true,         // ✅ conectado
    
//     driver: PostgresDriver {
//       master: Pool {              // ← el pool de conexiones, ya levantado
//         totalCount: 10,
//         idleCount: 10,            // las 10 están listas
//         waitingCount: 0,
//         clients: [
//           Client { /* conexión 1 */ },
//           Client { /* conexión 2 */ },
//           Client { /* conexión 3 */ },
//           // ... hasta 10
//         ]
//       }
//     },
    
//     manager: EntityManager {      // ← el que sabe hablar con todas las tablas
//       connection: [Circular],
//       repositories: Map { ... }
//     },
    
//     entityMetadatas: [            // ← TypeORM ya leyó tus entidades
//       EntityMetadata { name: "Producto", columns: [...], ... },
//       EntityMetadata { name: "Usuario",  columns: [...], ... },
//       EntityMetadata { name: "Pedido",   columns: [...], ... },
//     ],
    
//     queryResultCache: ...,
//     migrations: [...],
//   }
// }


// const db = await DatabaseUtil.getInstance();
// const productos = await db.getRepository(Producto)




// DatabaseUtil (la clase) = {
//     connection: DataSource {       ← propiedad ESTÁTICA, conectada
//         isInitialized: true,
//         driver: { pool: 10 conexiones },
//         manager: EntityManager,
//         entityMetadatas: [4 entidades]
//     },
//     instance: DatabaseUtil {       ← propiedad ESTÁTICA, el singleton
//         repositories: {}            ← propiedad de instancia, vacía
//     }
// }