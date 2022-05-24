import { RedisConfig } from "config/redis.config";
import Redis from "ioredis";

export default class RedisInstance {
  private static instance: Redis;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Redis {
    if (!RedisInstance.instance) {
      const client = new Redis({
        host: RedisConfig.host,
        port: RedisConfig.port,
      });

      RedisInstance.instance = client;
    }

    return RedisInstance.instance;
  }
}
