import bcrypt from "bcryptjs";
import User from "../Models/user.model.js";
import { generateTokenAndSetCookie } from "../Utils/generateTokenAndSetCookie.js";


export const SignUp = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        if (!fullname || !username || !password || !email) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email address." });
        }

        const userByName = await User.findOne({ username });
        if (userByName) return res.status(400).json({ error: "Username already exists." });

        const userByEmail = await User.findOne({ email });
        if (userByEmail) return res.status(400).json({ error: "Email already exists." });

        if (password.length < 6) {
            return res.status(400).json({ error: "Password should be at least 6 characters long." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ fullname, username, email, password: hashedPassword });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save();
            res.status(201).json({
                message: "User registered successfully.", user: {
                    id: newUser._id,
                    fullname: newUser.fullname,
                    username: newUser.username,
                    email: newUser.email,
                    followers: newUser.followers,
                    following: newUser.following,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
                    bio: newUser.bio,
                    link: newUser.link
                }
            });
        } else {
            return res.status(500).json({ error: "Failed to register user." });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const Login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const isMatch = await bcrypt.compare(password, user?.password || "");

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        generateTokenAndSetCookie(user._id, res)

        res.json({
            message: "Logged in successfully.", user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link
            }
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const Logout = async (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message })
    }
}

export const getMe = async (req, res) => {
    try {
        const userId = req.user._id;
        if(userId === undefined) {
            return res.status(401).json({error: "User not found"});
        }
        const user = await User.findById(userId).select("-password");
        if(!user || user === undefined) {
            return res.status(401).json({error: "User not found"});
        }
        res.status(200).json({ user });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}