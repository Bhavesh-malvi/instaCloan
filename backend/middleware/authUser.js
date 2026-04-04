import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export const AuthUser  = async (req, res, next) =>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next();

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}