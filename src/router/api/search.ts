import SearchController from "controllers/SearchController";
import express from "express";

const router = express.Router();

router.post("/log", SearchController.logSearch);
router.get("/trending", SearchController.trendingSearches);
router.get("/recent/:userId", SearchController.recentSearches);

export default router;