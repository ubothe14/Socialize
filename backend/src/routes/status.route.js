import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createStatus, getStatuses, viewStatus } from "../controllers/status.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createStatus);
router.get("/", getStatuses);
router.put("/:id/view", viewStatus);

export default router;
