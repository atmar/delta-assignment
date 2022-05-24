import RedisCache from "lib/redis/RedisCache";
import SearchService from "services/SearchService";
import RedisInstance from "lib/redis/RedisInstance";
import Redis from "ioredis";

jest.mock('uuid', () => ({ v4: () => '123456789' }))
jest.mock('moment', () => {
  return () => jest.requireActual('moment')('2020-01-01T00:00:00.000Z');
});

describe("Test log search", () => {
  let client: Redis = null;

  beforeAll(() => {
    client = RedisInstance.getInstance();
  });

  beforeEach(async () => {
    await client.flushall();
  })

  test("should cache asset id if not searched before by user", async () => {
    await SearchService.logSearch({asset_id: 5, user_id: 10});

    const resultAssets = await RedisCache.sortedSetGetRangeByScore("trending_assets", 0, 10);
    expect(resultAssets).toStrictEqual(["5"]);

    const resultAssetsTimestamp = await RedisCache.sortedSetGetRangeByScore("trending_assets_timestamp", 0, 15778368000);
    expect(resultAssetsTimestamp).toStrictEqual([`123456789:${5}`]);
  });

  test("should not count asset id in cache if searched before by user", async () => {
    await SearchService.logSearch({asset_id: 5, user_id: 10});

    let resultAssets = await RedisCache.sortedSetGetRangeByScore("trending_assets", 0, 1);
    expect(resultAssets).toStrictEqual(["5"]);

    await SearchService.logSearch({asset_id: 5, user_id: 10});
    resultAssets = await RedisCache.sortedSetGetRangeByScore("trending_assets", 0, 1);
    
    expect(resultAssets).toStrictEqual(["5"]);
  });

  test("should add asset search by user to recent searched list", async () => {
    await SearchService.logSearch({asset_id: 5, user_id: 10});
    await SearchService.logSearch({asset_id: 10, user_id: 10});

    const listRecentSearched = `recent_searched_assets:10`;
    let resultAssets = await RedisCache.getList(listRecentSearched, 0, 10);

    expect(resultAssets).toStrictEqual(["10", "5"]);
  });

  test("should get trending searches", async () => {
    await SearchService.logSearch({asset_id: 5, user_id: 10});
    await SearchService.logSearch({asset_id: 10, user_id: 10});
    await SearchService.logSearch({asset_id: 5, user_id: 1});

    const resultAssets = await SearchService.getTrendingSearches();

    expect(resultAssets).toStrictEqual({assetIds: [5, 10]});
  });

  test("should get recent searches for user", async () => {
    await SearchService.logSearch({asset_id: 5, user_id: 10});
    await SearchService.logSearch({asset_id: 10, user_id: 10});
    await SearchService.logSearch({asset_id: 20, user_id: 10});
    await SearchService.logSearch({asset_id: 5, user_id: 1});

    const resultAssets = await SearchService.getRecentSearches("10");

    expect(resultAssets).toStrictEqual({assetIds: [20, 10, 5]});
  });
});
