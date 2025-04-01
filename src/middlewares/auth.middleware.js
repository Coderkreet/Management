import jwt from "jsonwebtoken";
import { ApiError } from '../utils/ApiError.js'; // Ensure the file name matches exactly
import AsyncHandler from "../utils/AsyncHandler.js"
import { User } from "../models/User.model..js";


export const varifyJwt = AsyncHandler(async (req, res, next) => {

try {
     const token = req.cookies?.accessToken || req.headers ("Authorization")?.replace("Bearer", "")
    
        if(!token) {
            throw new ApiError(401, "No token provided");
        }
    
        // varify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            throw new ApiError(401, "Invalid token");
        }
    
        const user =  await User.findById(decoded._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(404, "User not found");
        }
    
        req.user= user;
        next();
} catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json(new ApiError(401, "Token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(new ApiError(401, "Invalid token"));
    } else {
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
    
}

})