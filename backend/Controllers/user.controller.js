import bcrypt from "bcryptjs";
import Notification from "../Models/notification.model.js";
import User from "../Models/user.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const getUserProfile = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        
        if(!user){
            return res.status(404).json({error: "User not found."});
        }
        
        res.status(200).json(user);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}

export const followUnfollowUser = async (req, res) => {
    const {id} = req.params;
    const userId = req.user._id;
    try {
        const userToModify = await User.findById(id);
        const currUser  = await User.findById(userId);
        
        if(!currUser){
            return res.status(401).json({error: "User not found."});
        }

        if(!userToModify){
            return res.status(404).json({error: "User not found."});
        }

        if(id === userId.toString()) {
            return res.status(400).json({error: "Cannot follow or unfollow yourself."});
        }

        const isFollowing = userToModify.followers.includes(userId);
        
        if(isFollowing){
           await User.findByIdAndUpdate(id, { $pull : {followers : userId}});
           await User.findByIdAndUpdate(userId, { $pull : {following : id}});
        }else{
            await User.findByIdAndUpdate(id, { $push : {followers : userId}});
            await User.findByIdAndUpdate(userId, { $push : {following : id}});
        }

        const newNotification =new Notification({
            from:userId,
            to:userToModify._id,
            type:'follow',
        })

        await newNotification.save();
        
        res.status(200).json({message: isFollowing? "Unfollowed" : "Followed"});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}


export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {$match:{
                _id: { $ne: userId }
            },
        },
            {$sample: { size: 10 }},
        ])

        const filterSuggestedUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filterSuggestedUsers.slice(0,5);

        suggestedUsers.forEach(user => users.password = null);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message}); 
    }
}


export const updateUser = async (req, res) => {
    const {username, email, fullname, currPassword, newPassword, bio, link} = req.body;
    let {profileImg, coverImg} = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        
        if(!user){
            return res.status(404).json({error: "User not found."});
        }

        if((!currPassword && newPassword) || (!newPassword && currPassword)){
            return res.status(400).json({error: "Please provide both current and new password."});
        }

        if(currPassword && newPassword){
            const isMatch = await bcrypt.compare(currPassword, user?.password || "");
            
            if(!isMatch){
                return res.status(401).json({error: "Invalid current password."});
            }

            if(newPassword.length < 6){
                return res.status(400).json({error: "New password should be at least 6 characters long."});
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }

        if(coverImg){
          if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
          }
          const uploadedResponse = await cloudinary.uploader.upload(coverImg);
          coverImg = uploadedResponse.secure_url;
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
              }
              const uploadedResponse = await cloudinary.uploader.upload(profileImg);
              profileImg = uploadedResponse.secure_url;
        }

        user.username = username || user.username;
        user.fullname = fullname ||  user.fullname;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.email = email || user.email;
        
        await user.save();

        user.password = null;

        res.status(200).json({message: "User updated successfully.", user});

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}