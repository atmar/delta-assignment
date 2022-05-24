import RedisCache from "lib/redis/RedisCache";
import Redis from "ioredis";
import RedisInstance from "lib/redis/RedisInstance";

describe("Test Redis Cache", () => {
  let client: Redis = null;

  beforeAll(() => {
    client = RedisInstance.getInstance();
  });

  beforeEach(async () => {
    await client.flushall();
  });

  test("should set cache key with value", async () => {
    const obj = { key: "value" };
    await RedisCache.set("key", obj);
    const value = await client.get("key");
    expect(value).toBe(JSON.stringify(obj));
  });

  test("get cache key that has value", async () => {
    const obj = { key: "value" };
    await client.set("key", JSON.stringify({ key: "value" }));
    const value = await RedisCache.get("key");
    expect(value).toStrictEqual(obj);
  });

  test("have existing key after setting cache key", async () => {
    const obj = { key: "value" };
    await RedisCache.set("key", obj);
    const value = await RedisCache.exists("key");
    expect(value).toBeTruthy();
  });

  test("successfully delete cache key", async () => {
    const obj = { key: "value" };
    await RedisCache.set("key", obj);

    let value = await RedisCache.get("key");
    expect(value).toStrictEqual(obj);

    await RedisCache.delete("key");
    value = await RedisCache.get("key");
    expect(value).toBeNull();
  });

  test("get cache key that has value", async () => {
    const obj = { key: "value" };
    await client.set("key", JSON.stringify({ key: "value" }));
    const value = await RedisCache.get("key");
    expect(value).toStrictEqual(obj);
  });

  test("add sorted set value with score", async () => {
    const key = "keyAdd";
    const value = await RedisCache.sortedSetAdd("list", key, 10);
    expect(value).toBe(1);
  });

  test("increase sorted set key with value", async () => {
    const key = "keyIncrScore";
    const value = await RedisCache.sortedSetIncreaseByScore("list", key, 10);
    expect(value).toBe(10);
  });

  test("decrease sorted set key with value", async () => {
    const key = "keyDecrScore";
    await RedisCache.sortedSetAdd("list", key, 10);
    const value = await RedisCache.sortedSetDecreaseByScore("list", key, 5);
    expect(value).toBe(5);
  });

  test("decrease sorted set key with value and delete if lower than or equal to 0", async () => {
    const key = "keyDecrScoreForDelete";
    await RedisCache.sortedSetAdd("list", key, 10);
    const value = await RedisCache.sortedSetDecreaseByScore("list", key, 10);
    expect(value).toBeUndefined();
  });

  test("get sorted set between min and max score", async () => {
    await RedisCache.sortedSetAdd("list", "key1", 5);
    await RedisCache.sortedSetAdd("list", "key2", 10);
    const value = await RedisCache.sortedSetGetRangeByScore("list", 0, 10);
    expect(value).toStrictEqual(["key2", "key1"]);
  });

  test("get all keys in sorted set", async () => {
    await RedisCache.sortedSetAdd("list", "key1", 5);
    await RedisCache.sortedSetAdd("list", "key2", 100000000);
    const value = await RedisCache.sortedSetGetRangeByScore("list", "-inf", "+inf");
    expect(value).toStrictEqual(["key2", "key1"]);
  });

  test("don't get sorted set between invalid min and max score", async () => {
    await RedisCache.sortedSetAdd("list", "key1", 5);
    await RedisCache.sortedSetAdd("list", "key2", 10);
    const value = await RedisCache.sortedSetGetRangeByScore("list", 20, 30);
    expect(value).toStrictEqual([]);
  });

  test("add keys to list in FIFO order", async () => {
    await RedisCache.listAdd("list", "key1");
    await RedisCache.listAdd("list", "key2");
    await RedisCache.listAdd("list", "key3");
    const value = await RedisCache.getList("list", 0, 10);
    expect(value).toStrictEqual(["key3","key2","key1"]);
  });

  test("remove first added key from list", async () => {
    await RedisCache.listAdd("list", "key1");
    await RedisCache.listAdd("list", "key2");
    await RedisCache.listAdd("list", "key3");
    await RedisCache.listPop("list");
    const value = await RedisCache.getList("list", 0, 10);
    expect(value).toStrictEqual(["key3","key2"]);
  });

  test("get list length", async () => {
    await RedisCache.listAdd("list", "key1");
    await RedisCache.listAdd("list", "key2");
    await RedisCache.listAdd("list", "key3");
    const value = await RedisCache.getListLength("list");
    expect(value).toBe(3);
  });
});
