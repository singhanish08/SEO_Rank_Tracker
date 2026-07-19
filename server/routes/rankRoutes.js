import express from "express";
import auth from "../middleware/auth.js";
import rateLimit from "express-rate-limit";
import { addKeyword, deleteKeyword, getKeyword, getKeywords, refreshKeyword, runScheduledTracking, toggleTracking } from "../controllers/rankController.js";

const rankRouter = express.Router();
const rankCheckLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.userId,
    message: { success: false, message: "Too many rank checks. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

rankRouter.post("/add", auth, rankCheckLimiter, addKeyword);
rankRouter.get("/list", auth, getKeywords);
rankRouter.get("/run-scheduled", runScheduledTracking);
rankRouter.get("/:id", auth, getKeyword);
rankRouter.post("/:id/refresh", auth, rankCheckLimiter, refreshKeyword);
rankRouter.put("/:id/toggle", auth, toggleTracking);
rankRouter.delete("/:id", auth, deleteKeyword);

export default rankRouter;
