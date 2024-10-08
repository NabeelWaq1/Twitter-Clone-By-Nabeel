import Notification from "../Models/notification.model.js";
import Post from "../Models/post.model.js";
import User from "../Models/user.model.js";
import {v2 as cloudinary} from 'cloudinary'


export const getPosts = async (req,res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path:'user',
            select: '-password'
        }).populate({
            path:'comments.user',
            select: '-password'
        })

        if(!posts){
            return res.status(404).json({error: "No posts found."});
        }
        
        res.status(200).json({posts});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}


export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(401).json({error: "User not found."});
        }
        
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path:'user',
            select: '-password'
        }).populate({
            path:'comments.user',
            select: '-password'
        })

        if(!likedPosts){
            return res.status(404).json({error: "No liked posts found."});
        }
        
        res.status(200).json({likedPosts});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}


export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {image} = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if(!user) {
            return res.status(401).json({error: "User not found."});
        }
        
        if(!text &&!image){
            return res.status(400).json({error: "Post must contain  text or image."});
        }

        if(image){
           const uploadedResponse = await cloudinary.uploader.upload(image);
           image = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            text,
            image,
            user: userId,
        });

        await newPost.save();

        res.status(201).json({post: newPost});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}

export const deletePost = async (req, res) => {
    try {
        const {id:postId} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error: "Post not found."});
        }
        
        if(post.user.toString()!== userId.toString()){
            return res.status(403).json({error: "Unauthorized to delete this post."});
        }

        if(post.image){
            await cloudinary.uploader.destroy(post.image.split('/').pop().split('.')[0]);
        }

        await Post.findByIdAndDelete(postId);
        
        res.status(200).json({message: "Post deleted successfully."});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}

export const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id
        const {text} = req.body;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error: "Post not found."});
        }

        if(!text){
            return res.status(400).json({error: "Comment must contain text."});
        }

        const newComment = {user: userId, text: text};
        post.comments.push(newComment);
        await post.save();
        
        res.status(201).json({comment: newComment});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}


export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({error: "Post not found."});
        }

        const postLiked = post.likes.includes(userId);
        if(postLiked){
           await Post.updateOne({_id:postId},{$pull:{likes:userId}});
           await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
           const updatedLikes = post.likes.filter(id => id.toString() !== userId.toString())
           return res.status(200).json(updatedLikes);
        } else {
            post.likes.push(userId);
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
            await post.save();

            const newNotification = new Notification({
                to: post.user,
                from: userId,
                type: "like"
            })
            const updatedLikes = post.likes;
            if(newNotification.to.toString() === newNotification.from.toString()){
                return res.status(200).json(updatedLikes);
            }
            await newNotification.save();


            return res.status(201).json(updatedLikes);
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}


export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const currUser = await User.findById(userId);
        if(!currUser) {
            return res.status(401).json({error: "User not found."});
        }
        
        const followingUserIds = currUser.following;
        if(!followingUserIds){
            return res.status(404).json({error: "No following posts found."});
        }
        const followingPosts = await Post.find({user: {$in: followingUserIds}}).sort({createdAt: -1}).populate({
            path:'user',
            select: '-password'
        }).populate({
            path:'comments.user',
            select: '-password'
        })
        
        if(!followingPosts){
            return res.status(404).json({error: "No following posts found."});
        }
        
        return res.status(200).json({posts:followingPosts});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message})
    }
}


export const getPostsOfUser = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
        path:'user',
        select: '-password'
        }).populate({
            path:'comments.user',
            select: '-password'
        })
        
        if(!posts){
            return res.status(404).json({error: "No posts found by this user."});
        }
        
        res.status(200).json({posts});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message})
    }
}