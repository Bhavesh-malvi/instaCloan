import User from "../models/User.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/GenerateToken.js";
import uploadImage from "../config/cloudinary.js";

export const signup = async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        if (!fullname || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const isUser = await User.findOne({ $or: [{ username }, { email }] })

        if (isUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            fullname,
            username,
            email,
            password: hashedPassword
        })

        const token = generateToken(user._id, res)

        return res.status(201).json({
            success: true,
            user,
            token
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;


        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        const token = generateToken(user._id, res)

        return res.status(200).json({
            success: true,
            user,
            token
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const getProfile = async (req, res) =>{
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const updateUser = async (req, res) =>{
    try {
        const userId = req.user.id;

        const {fullname, username, bio} = req.body;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const existUser = await User.findOne({username});

        if(existUser && existUser._id.toString() !== userId.toString()){
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            })
        }

        let profilePic;

        if(req.file){
            profilePic = await uploadImage(req.file.path);
        }

        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.profilePic = profilePic || user.profilePic;

        await user.save();

        return res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV !== "development"
        })

        return res.status(200).json({
            success: true,
            message: "Logout successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserid = req.user._id

        if (userId === currentUserid.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            })
        }

        const userToFollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserid);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (currentUser.following.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You are already following this user"
            })
        }

        currentUser.following.push(userId);
        userToFollow.followers.push(currentUserid);

        await currentUser.save();
        await userToFollow.save();

        return res.status(200).json({
            success: true,
            message: "User followed successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const userTounFollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);


        if (!userTounFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        currentUser.following = currentUser.following.filter(id => id.toString() !== userId.toString());
        userTounFollow.followers = userTounFollow.followers.filter(id => id.toString() !== currentUserId.toString());

        await currentUser.save();
        await userTounFollow.save();

        return res.status(200).json({
            success: true,
            message: "User unfollowed"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const getSuggestedUser = async (req, res) =>{
    try {
        const currentUser = await User.findById(req.user._id);

        const followingUser = await User.find({
            _id: {$in: currentUser.following}
        }).select("following");

        let suggestion =  followingUser.flatMap(user => user.following);

        suggestion = suggestion.filter(
            id => id.toString() !== req.user._id.toString() && !currentUser.following.includes(id)
        ).limit(10);

        const uniqueId = [...new Set(suggestion.map(id=> id.toString()))]

        const users = await User.find({
            _id: {$in : uniqueId}
        }).select("username profilePic");

        return res.status(200).json({
            success: true,
            users
        }) 
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}