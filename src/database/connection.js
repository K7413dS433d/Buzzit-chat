import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose
    .connect(process.env.DATABASE_URI)
    .then(() => console.log("DB Connected"))
    .catch((err) => {
      console.log(err);
    });
};

export default connectDB;
