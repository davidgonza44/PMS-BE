import { BaseService } from "../../utils/base_service.js"
import { Users } from "../../components/users/users_entity.js"
import { Repository } from "typeorm"
import {jest} from "@jest/globals"

describe("BaseService.findOne()", () => {
    it("Debe devolver el usuario simulado", async () => {
        const mockUser = {
            user_id : "12345",
            fullname: "david",
            username: "david",
            email: "Alice.example@gmail.com"
        } as Users

        const mockRepository = {
            metadata: {
                primaryColumns : [
                    {
                        databaseName : "user_id"
                    }
                ]
            },
            findOne: jest.fn(async ()  => mockUser)
        } as unknown as Repository<Users>

        const service = new BaseService<Users>(mockRepository)
        const result = await service.findOne("12345")

        expect(result.statusCode).toBe(200)
        expect(result).toEqual({
            statusCode : 200,
            status: "success",
            data: mockUser
        })

        expect(mockRepository.findOne).toHaveBeenCalledWith({
                relations : undefined,
                where : {user_id : "12345"}
        })

    })
})