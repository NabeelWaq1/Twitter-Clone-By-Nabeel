import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";


export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({error: "Not authenticated."});
        }

        const payload = jwt.verify(token, process.env.JWT_TOKEN);

        if(!payload){
            return res.status(401).json({error: "Token is invalid."});
        }

        const user = await User.findById(payload.userId);
        
        if(!user){
            return res.status(401).json({error: "User not found."});
        }
        
        req.user = user;
        next();

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: error.message});
    }
}