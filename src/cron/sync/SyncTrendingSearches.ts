import ICron from "interfaces/cron/ICron";
import RedisCache from "lib/redis/RedisCache";
import moment from "moment";

export default class SyncTrendingSearches implements ICron {
  constructor() {}

  async execute(): Promise<void> {
    const minScore = 0;
    const maxScore = moment().subtract(24, "h").unix();
    const results = await RedisCache.sortedSetGetRangeByScore("trending_assets_timestamp", minScore, maxScore);

    const assetIds = results.map((result) => result.split(":")[1]);

    await Promise.all(
      assetIds.map(async (assetId) => {
        await RedisCache.sortedSetDecreaseByScore("trending_assets", assetId, 1);
      })
    );
  }
}
