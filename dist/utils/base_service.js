import { DatabaseError } from 'pg';
export class BaseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(entity) {
        try {
            const createdEntity = await this.repository.create(entity);
            const savedEntity = await this.repository.save(createdEntity);
            return {
                statusCode: 201,
                status: "success",
                data: savedEntity,
            };
        }
        catch (error) {
            if (error instanceof DatabaseError && error.code === '23505') {
                return {
                    statusCode: 409,
                    status: "error",
                    message: "Entity already exists"
                };
            }
            else {
                return {
                    statusCode: 500,
                    status: "error",
                    message: "An unexpected error occurred"
                };
            }
        }
    }
    async update(id, updateData) {
        try {
            const isExist = await this.findOne(id);
            if (isExist?.statusCode === 404) {
                return isExist;
            }
            const where = {};
            const primaryKey = this.repository.metadata.primaryColumns[0].databaseName;
            where[primaryKey] = id;
            const validColumns = await this.repository.metadata.columns.map(col => col.databaseName);
            const updateQuery = {};
            const keys = Object.keys(updateData);
            for (const key of keys) {
                if (updateData.hasOwnProperty(key) && validColumns.includes(key)) {
                    updateQuery[key] = updateData[key];
                }
            }
            const result = await this.repository.createQueryBuilder()
                .update()
                .set(updateQuery)
                .where(where)
                .returning("*")
                .execute();
            if (result.affected && result.affected > 0) {
                return {
                    statusCode: 200,
                    status: 'success',
                    data: result.raw[0]
                };
            }
            else {
                return {
                    statusCode: 404,
                    status: 'error',
                    message: "Not Found"
                };
            }
        }
        catch (error) {
            if (error instanceof DatabaseError) {
                return {
                    statusCode: 500,
                    status: 'error',
                    message: error.message
                };
            }
        }
    }
    async findOne(id) {
        try {
            const where = {};
            const primaryKey = this.repository.metadata.primaryColumns[0].databaseName;
            where[primaryKey] = id;
            const options = { where: where };
            const data = await this.repository.findOne(options);
            if (data) {
                return {
                    status: 'success',
                    statusCode: 200,
                    data: data
                };
            }
            else {
                return {
                    status: 'error',
                    statusCode: 404,
                    message: "Not Found"
                };
            }
        }
        catch (error) {
            return {
                statusCode: 500,
                status: "error",
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            };
        }
    }
    async delete(id) {
        try {
            const isExist = await this.findOne(id);
            if (isExist?.statusCode === 404) {
                return isExist;
            }
            await this.repository.delete(id);
            return {
                statusCode: 200,
                status: "success",
                message: "Entity deleted successfully"
            };
        }
        catch (error) {
            return {
                statusCode: 500,
                status: "error",
                message: 'An unexpected error occurred'
            };
        }
    }
    async customQuery(condition, parameters = {}) {
        try {
            const data = await this.repository.createQueryBuilder("entity")
                .where(condition, parameters)
                .getMany();
            return data;
        }
        catch (error) {
            console.log(`Error executing custom query: ${condition} => ${error}`);
            return [];
        }
    }
    async findByIds(ids) {
        try {
            const primaryKey = this.repository.metadata.primaryColumns[0].databaseName;
            const data = await this.repository
                .createQueryBuilder()
                .whereInIds(ids)
                .getMany();
            return {
                statusCode: 200,
                status: "success",
                data: data
            };
        }
        catch (error) {
            return {
                statusCode: 500,
                status: "error",
                message: 'An unexpected error occurred'
            };
        }
    }
    async findAll(queryParams) {
        try {
            let data = [];
            const validColumns = this.repository.metadata.columns.map(col => col.databaseName);
            if (Object.keys(queryParams).length > 0) {
                const query = await this.repository.createQueryBuilder();
                for (const field in queryParams) {
                    if (queryParams.hasOwnProperty(field) && validColumns.includes(field)) {
                        const value = queryParams[field];
                        query.andWhere(`${field} = :${field}`, { [field]: value });
                    }
                }
                data = await query.getMany();
                return {
                    status: "success",
                    statusCode: 200,
                    data: data
                };
            }
            else {
                data = await this.repository.find();
            }
            return {
                status: "success",
                statusCode: 200,
                data: data
            };
        }
        catch (error) {
            return {
                statusCode: 500,
                status: "error",
                data: [],
                message: "An unexpected error occurred"
            };
        }
    }
}
