import express from "express";
import { deleteNotifications, getNotifications } from "../Controllers/notification.controller.js";
import { protectRoute } from "../Middlewares/protectRoute.js";

const router = express.Router();

router.get('/get', protectRoute ,getNotifications);
router.delete('/del', protectRoute ,deleteNotifications);

export default router;