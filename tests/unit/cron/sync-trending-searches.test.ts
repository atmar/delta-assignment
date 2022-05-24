import SyncTrendingSearches from "cron/sync/SyncTrendingSearches";
import RedisCache from "lib/redis/RedisCache";
import RedisInstance from "lib/redis/RedisInstance";
import SearchService from "services/SearchService";
import Redis from "ioredis";

describe("Test Redis Cache", () => {
  let client: Redis = null;

  beforeAll(() => {
    client = RedisInstance.getInstance();
  });

  beforeEach(async () => {
    await client.flushall();
  })
  
  test("Do not delete trending assets if less than 24h ago", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 12:00:00"));
    await SearchService.logSearch({ asset_id: 5, user_id: 10 });
    await SearchService.logSearch({ asset_id: 5, user_id: 10 });
    await SearchService.logSearch({ asset_id: 10, user_id: 10 });
    await SearchService.logSearch({ asset_id: 15, user_id: 10 });

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 23:00:00"));

    const cron = new SyncTrendingSearches();
    await cron.execute();

    const resultAssets = await RedisCache.sortedSetGetRangeByScore("trending_assets", 0, 10);
    expect(resultAssets).toStrictEqual(["5", "15", "10"]);
  });

  test("Delete trending assets if over 24h ago", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 12:00:00"));
    await SearchService.logSearch({ asset_id: 5, user_id: 10 });
    await SearchService.logSearch({ asset_id: 5, user_id: 10 });
    await SearchService.logSearch({ asset_id: 10, user_id: 10 });

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01 23:00:00"));
    await SearchService.logSearch({ asset_id: 15, user_id: 10 });

    jest.useFakeTimers().setSystemTime(new Date("2020-01-02 12:00:00"));

    const cron = new SyncTrendingSearches();
    await cron.execute();

    const resultAssets = await RedisCache.sortedSetGetRangeByScore("trending_assets", 0, 10);
    expect(resultAssets).toStrictEqual(["15"]);
  });

});
