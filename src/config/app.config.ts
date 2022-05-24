import dotenv from 'dotenv'

dotenv.config()

export const AppConfig = {
    port: parseInt(process.env.PORT) || 3000,
    environment: process.env.NODE_ENV || 'development',
}