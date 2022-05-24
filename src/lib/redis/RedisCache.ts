import RedisInstance from "./RedisInstance"

export default class RedisCache {
  public static async set(key: string, value: any, time: number = 3600 * 24): Promise<void> {
    const client = RedisInstance.getInstance();

    value = JSON.stringify(value)

    await client.set(key, value, "EX", time);
  }

  public static async get(key: string): Promise<any> {
    const client = RedisInstance.getInstance();
    const value = await client.get(key);

    return JSON.parse(value);
  }

  public static async exists(key: string): Promise<boolean> {
    const client = RedisInstance.getInstance();
    const result = await client.exists(key);
    return result === 1 ? true : false;
  }

  public static async delete(key: string): Promise<void> {
    const client = RedisInstance.getInstance();
    await client.del(key);
  }

  public static async sortedSetIncreaseByScore(list: string, key: string, score: number): Promise<number> {
    const client = RedisInstance.getInstance();
    const result = await client.zincrby(list, score, key);
    return parseInt(result);
  }

  public static async sortedSetDecreaseByScore(list: string, key: string, score: number): Promise<number> {
    const client = RedisInstance.getInstance();
    const result = await client.zincrby(list, score * -1, key);
    if (parseInt(result) <= 0) {
      await RedisCache.sortedSetDelete(list, key);
      return;
    }
    return parseInt(result);
  }
  
  public static async sortedSetDelete(list: string, key: string): Promise<void> {
    const client = RedisInstance.getInstance();
    await client.zrem(list, key);
  }

  public static async sortedSetAdd(list: string, key: string, score: number): Promise<number> {
    const client = RedisInstance.getInstance();
    return await client.zadd(list, score, key);
  }

  public static async sortedSetGetRangeByScore(list: string, minScore: number | string, maxScore: number | string): Promise<string[]> {
    const client = RedisInstance.getInstance();
    return await client.zrevrangebyscore(list, maxScore, minScore);
  }

  public static async listAdd(list: string, key: string): Promise<number> {
    const client = RedisInstance.getInstance();
    return await client.lpush(list, key);
  }

  public static async listPop(list: string): Promise<string> {
    const client = RedisInstance.getInstance();
    return await client.rpop(list);
  }

  public static async getList(list: string, min: number, max: number): Promise<string[]> {
    const client = RedisInstance.getInstance();
    return await client.lrange(list, min, max);
  }

  public static async getListLength(list: string): Promise<number> {
    const client = RedisInstance.getInstance();
    return await client.llen(list);
  }
}