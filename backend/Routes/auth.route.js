import express from "express";
import { SignUp } from "../Controllers/auth.controller.js";

const router = express.Router();

router.get('/signup', SignUp )

export default router;