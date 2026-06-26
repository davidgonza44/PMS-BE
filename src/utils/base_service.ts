import { DeepPartial, FindOneOptions, ObjectLiteral, Repository } from "typeorm";
import { DatabaseError, Query} from 'pg'
import type { FindOptionsRelations } from "typeorm";

export type updateDataKeys<T> = keyof DeepPartial<T> & keyof T

export type ApiResponse<T> = 
{
    status: "success" ;
    statusCode : 200 | 201,
    data?: T,
    message?: string
} 
    | 
{
    status: "error",
    statusCode: 400 | 401 | 403 | 404 | 409 | 500
    message: string,
    data?: never
}

export class BaseService<T extends ObjectLiteral > {
    constructor(protected readonly repository : Repository<T>) {}
    async create(entity : DeepPartial<T>) : Promise<ApiResponse<T>> {
        try {
            const createdEntity = await this.repository.create(entity);
            const savedEntity = await this.repository.save(createdEntity);
            return {
                statusCode: 201,
                status: "success",
                data: savedEntity,

            }
        } catch (error) {
            if ( error instanceof DatabaseError && error.code === '23505'){
                return {
                    statusCode: 409,
                    status: "error",
                    message: "Entity already exists"
                }
            } else {
                return {
                    statusCode: 500,
                    status: "error",
                    message: "An unexpected error occurred"
                }
            }
        }
    }

    async update(id: string, updateData: DeepPartial<T>) : Promise<ApiResponse<T>> {
        try{
            const isExist = await this.findOne(id)
            if (isExist?.statusCode === 404){
                return isExist
            }

            const where = {}
            const primaryKey : string = this.repository.metadata.primaryColumns[0].databaseName; //dame la llave primaria como esta en la bd
            where[primaryKey] = id; // en el objeto where crea una propiedad que se llame lo que valga primaryKey
            const validColumns = await this.repository.metadata.columns.map(col => col.databaseName)
            const updateQuery : any = {}
            const keys = Object.keys(updateData) as updateDataKeys<T>[] // array de propiedades validas de T
            for (const key of keys){
                if (Object.prototype.hasOwnProperty.call(updateData, key) && validColumns.includes(key as string)){ //valido que lo que el cliente me pide sea una columna valida en la bd
                    updateQuery[key] = updateData[key]
                }
            }
            if (Object.keys(updateQuery).length === 0) {
            return {
                statusCode: 400,
                status: "error",
                message: "No valid fields to update"
            }
}
            const result = await this.repository.createQueryBuilder()
                .update()
                .set(updateQuery)
                .where(where)
                .returning("*") // devuelveme el registro completo despues de la actualizacion
                .execute()

                if (result.affected && result.affected > 0){
                    return {
                        statusCode : 200,
                        status: 'success',
                        data: result.raw[0] // el registro actualizado completo
                    }
                } else {
                    return {
                        statusCode : 404,
                        status: 'error',
                        message: "Not Found"
                    }
                }

        } catch(error){
            if (error instanceof DatabaseError){
                return {
                    statusCode : 500,
                    status: 'error',
                    message: error.message 
                }
            }
            return {
                statusCode : 500,
                status: 'error',
                message : error instanceof Error ? error.message : "An unexpected error occurred"
            }
        }
    }


    async findOne(id : string,  relations?: FindOptionsRelations<T>) : Promise<ApiResponse<T>> {
        try{

            const where = {}
            const primaryKey : string = this.repository.metadata.primaryColumns[0].databaseName; //dame la llave primaria como esta en la bd
            where[primaryKey] = id; // en el objeto where crea una propiedad que se llame lo que valga primaryKey
            const options : FindOneOptions<T> = { 
                where : where,
                relations
            } //obj de opc que espera typeorm
            const data = await this.repository.findOne(options) // typeorm cuando no cons un registri devuelve null
            if (data){
                return{
                    status : 'success',
                    statusCode : 200,
                    data: data
                }
            } else { 
                return {
                    status : 'error',
                    statusCode : 404,
                    message : `${this.repository.metadata.name} Not Found`
                }
            }
        } catch(error){
            return {
                statusCode : 500,
                status: "error",
                message : error instanceof Error ? error.message : "An unexpected error occurred"
            }
        }
    }

    async delete(id : string) : Promise<ApiResponse<T>> {
        try{
            const isExist : ApiResponse<T> | undefined = await this.findOne(id)
            if (isExist.status === "error"){
                return isExist
            }

            const result = await this.repository.delete(id)
            return {
                statusCode : 200,
                status: "success",
                message: "Entity deleted successfully"
            }

        } catch (error){
            return {
                statusCode : 500,
                status : "error",
                message : 'An unexpected error occurred'
            }
        }
    }

    async customQuery(
        condition : string,
        parameters: Record<string, unknown> = {}
    ) : Promise<T[]> { // nunca debe recibir input del cliente, solo para consultas internas
        try{
            const data = await this.repository.createQueryBuilder("entity")
            .where(condition, parameters)
            .getMany()

            return data

        } catch(error){
            console.log(`Error executing custom query: ${condition} => ${error}`)
            return []
        }
    }

    async findByIds(ids : string[]) : Promise<ApiResponse<T[]>>{
        try{
            const primaryKey : string = this.repository.metadata.primaryColumns[0].databaseName;
            const data = await this.repository
            .createQueryBuilder()
            .whereInIds(ids)
            .getMany() // traeme todos los registros que tengan un id dentro del array de ids

            return {
                statusCode : 200,
                status : "success",
                data : data
            }

        } catch(error){
            return {
                statusCode : 500,
                status : "error",
                message : 'An unexpected error occurred'
            }
        }
    }


    async findAll(queryParams : object) : Promise<ApiResponse<T[]>> {
        try {
            let data : T[] = []
            const validColumns =  this.repository.metadata.columns.map(col => col.databaseName)
            if (Object.keys(queryParams).length > 0 ){
                const query = await this.repository.createQueryBuilder('entity')
                for (const field in queryParams){
                    if (Object.prototype.hasOwnProperty.call(queryParams, field) && validColumns.includes(field)){
                        const value = queryParams[field] 
                        query.andWhere(`entity.${field} = :${field}`, { [field] : value }) // la clave es el contenido de field
                    } // cuando encuentres un hueco etiqeutado como :field, mete el valor de value
                }
                data = await query.getMany()
                return {
                    status: "success",
                    statusCode: 200,
                    data: data
                }
            } else {
                data = await this.repository.find()
            }

            return {
                    status: "success",
                    statusCode: 200,
                    data: data
                }
        } catch (error) {
            console.error(error)
            return {
                statusCode : 500,
                status: "error",
                message : "An unexpected error occurred"
            }
        }

    }
}


// Crea el objeto de opciones que espera TypeORM para hacer el SELECT,
//  con la condición WHERE que construiste
