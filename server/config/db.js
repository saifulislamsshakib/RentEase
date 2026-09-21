import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected successfully");
  } catch (error) {
    console.log("MongoDB does not connect:", error.message);
    process.exit(1);
  }
};

export default connectDB;
