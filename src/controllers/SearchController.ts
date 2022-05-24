import { Request, Response } from "express";
import SearchService from "services/SearchService";

export default class SearchController {
  static async logSearch(req: Request, res: Response) {
    await SearchService.logSearch(req.body);
    return res.sendStatus(201);
  }

  static async trendingSearches(req: Request, res: Response) {
    const result = await SearchService.getTrendingSearches();
    return res.status(200).send(result)
  }

  static async recentSearches(req: Request, res: Response) {
    const result = await SearchService.getRecentSearches(req.params.userId);
    return res.status(200).send(result)
  }
}
