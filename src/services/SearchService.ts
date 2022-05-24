import RedisCache from "lib/redis/RedisCache";
import { RecentSearchesResponse } from "interfaces/responses/search/RecentSearchesResponse ";
import { TrendingSearchesResponse } from "interfaces/responses/search/TrendingSearchesResponse";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { LogSearchRequest } from "interfaces/requests/search/LogSearchRequest";

export default class SearchService {
  static async logSearch(data: LogSearchRequest): Promise<void> {
    const listRecentSearched = `recent_searched_assets:${data.user_id}`;
    await RedisCache.listAdd(listRecentSearched, data.asset_id.toString());
    const recentListLength = await RedisCache.getListLength(listRecentSearched);

    if (recentListLength > 100) {
      await RedisCache.listPop(listRecentSearched);
    }

    const alreadySearched = await RedisCache.exists(`${data.user_id}:${data.asset_id}`);
    if (alreadySearched) {
      return;
    }

    await Promise.all([
      RedisCache.set(`${data.user_id}:${data.asset_id}`, true, 60 * 60 * 24),
      RedisCache.sortedSetAdd("trending_assets_timestamp", `${uuidv4()}:${data.asset_id}`, moment().unix()),
      RedisCache.sortedSetIncreaseByScore("trending_assets", data.asset_id.toString(), 1)
    ]);
  }

  static async getTrendingSearches(): Promise<TrendingSearchesResponse> {
    const trendingAssetIds = await RedisCache.sortedSetGetRangeByScore("trending_assets", "-inf", "+inf");
    const assetIdsNumber = trendingAssetIds.map((id) => parseInt(id));
    
    return { assetIds: assetIdsNumber };
  }

  static async getRecentSearches(userId: string): Promise<RecentSearchesResponse> {
    const listRecentSearched = `recent_searched_assets:${userId}`;
    const recentAssetIds = await RedisCache.getList(listRecentSearched, 0, 100);
    const assetIdsNumber = recentAssetIds.map((id) => parseInt(id));

    return { assetIds: assetIdsNumber };
  }
}
