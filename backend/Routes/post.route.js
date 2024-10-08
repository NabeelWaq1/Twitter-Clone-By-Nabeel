import express from "express";

import { protectRoute } from "../Middlewares/protectRoute.js";
import { commentPost, createPost, deletePost, likeUnlikePost, getPosts, getLikedPosts, getPostsOfUser, getFollowingPosts } from "../Controllers/post.controller.js";

const router = express.Router();

router.get('/all', protectRoute , getPosts);
router.get('/liked/:id', protectRoute , getLikedPosts);
router.get('/user/:username', protectRoute , getPostsOfUser);
router.get('/following', protectRoute , getFollowingPosts);
router.post('/create', protectRoute , createPost);
router.delete('/:id', protectRoute , deletePost);
router.post('/comment/:id', protectRoute , commentPost);
router.post('/like/:id', protectRoute , likeUnlikePost);

export default router;