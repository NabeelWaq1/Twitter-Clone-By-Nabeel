import express from "express";
import { getMe, Login, Logout, SignUp } from "../Controllers/auth.controller.js";
import { protectRoute } from "../Middlewares/protectRoute.js";

const router = express.Router();

router.post('/signup', SignUp );
router.post('/login', Login );
router.post('/logout', Logout );
router.get('/me', protectRoute, getMe );

export default router;