import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImage = async (filePath) =>{
    try {
        const result = await cloudinary.uploader.upload(filePath);

        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }

        return result.secure_url;

    } catch (error) {
        console.log(error);
        return null;
    }
}

export default uploadImage;