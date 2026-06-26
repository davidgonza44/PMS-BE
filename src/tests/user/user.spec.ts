import request from "supertest"
import {app} from "../../express_server.js"
import { setupIntegrationDatabase } from "../common/test_setup.js";

if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    throw new Error("Test credentials are missing")
}

setupIntegrationDatabase()
let authToken;

describe("LOGIN API", () => {
    it("debe iniciar sesion correctamente", async() => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: process.env.TEST_USER_EMAIL,
                password: process.env.TEST_USER_PASSWORD
            })


        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success")
        expect(response.body.data).toHaveProperty("access_token")

        authToken = response.body.data.access_token
    })

    it("debe rechazar una contrasena incorrecta", async() => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: process.env.TEST_USER_EMAIL,
                password: "deff4442ef1sd"
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe("error")
            expect(response.body.message).toBe("Invalid email or password")
            
    })
})

describe("add user", () => {
    const suffix = Date.now()
    it("Debe crear el usuario y luego rechazar el duplicado", async () =>{
        const response = await request(app)
            .post("/api/users")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                fullname: "Super",
                username: `pms-admin-${suffix}`,
                email: `admin-${suffix}@gmail.com`,
                password: "Admin@pms1",
                role_id: "60b95256-461c-4847-8151-ea82af3780ea"
            })
        console.log(JSON.stringify(response.body, null, 2))
        expect(response.statusCode).toBe(201)
        expect(response.body.status).toBe("success")
    })
})

describe("get list of users", () => {
    it("Devuelve un array con status", async () => {
        const response = await request(app)
        .get('/api/users')
        .set("Authorization", `Bearer ${authToken}`)

        expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.body.data)).toBe(true)
    })

})