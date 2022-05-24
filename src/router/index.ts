import express from "express";
import search from "router/api/search";

const router = express.Router();

router.use('/search', search);

export default router