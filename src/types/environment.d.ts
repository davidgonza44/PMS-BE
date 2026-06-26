declare global{
    namespace NodeJS{
        interface ProcessEnv{
            DB_HOST: string
            DB_PORT: string
            DB_USERNAME: string
            DB_PASSWORD: string
            DB_NAME: string
            TEST_USER_EMAIL: string
            TEST_USER_PASSWORD: string
            PORT: string
            MAIL_USER : string,
            JWT_SECRET: string
        }
    }
}