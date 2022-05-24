import dotenv from "dotenv";

dotenv.config();

export const RedisConfig = {
  port: parseInt(process.env.REDIS_PORT) || 6379,
  host: process.env.REDIS_HOST || "127.0.0.1",
  password: process.env.REDIS_PASSWORD || null,
};
