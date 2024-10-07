import express from "express";

import { protectRoute } from "../Middlewares/protectRoute.js";
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUser } from "../Controllers/user.controller.js";

const router = express.Router();

router.get('/profile/:username', protectRoute , getUserProfile);
router.post('/follow/:id', protectRoute , followUnfollowUser);
router.get('/suggestedUsers', protectRoute , getSuggestedUser);
router.post('/update', protectRoute , updateUser);


export default router;