import mongoose from "mongoose";

const connectDB = async (DB_URL: any) => {
    try {
        let db = await mongoose.connect(DB_URL)
        console.log("DB Connected : " + db.connection.name);
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;