import mongoose from "mongoose";
import { hashOTP } from "./hooks/OTP-hashing.hook.js";

const otpSchema = new mongoose.Schema(
  {
    otp: {
      type: String, // hashed OTP
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
otpSchema.pre("save", hashOTP);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
