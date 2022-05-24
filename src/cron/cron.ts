import cron from "node-cron";
import SyncTrendingSearches from "./sync/SyncTrendingSearches";

cron.schedule("* * * * *", () => {
  const sync = new SyncTrendingSearches();
  sync.execute();
});

export default cron;
