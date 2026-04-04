import mongoose from "mongoose";


export const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("mongoDb Connected");
        
    } catch (error) {
        console.log("Error in mongoDb Connection", error);
        process.exit(1);
    }
}