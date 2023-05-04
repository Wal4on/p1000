import dotenv from "dotenv";
dotenv.config();


import mongoose from "mongoose";
mongoose.set("strictQuery", false);




const connect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Successfully connected to MongoDB!");
    }
    catch(err) {
        console.log("Error: ", err.message);
    }
}




connect();
