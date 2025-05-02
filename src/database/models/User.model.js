import mongoose from "mongoose";
import { hashPassword } from "./hooks/password-hashing.js";
import {
  appInfo,
  defaultProfilePic,
} from "../../common/constants/index.constants.js";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      default: function () {
        return appInfo.APP_NAME + this._id.toString().slice(0, 3);
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilePic: {
      secure_url: {
        type: String,
        default: defaultProfilePic.SECURE_URL,
      },
      public_id: {
        type: String,
        default: defaultProfilePic.PUBLIC_ID,
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", hashPassword);

const User = mongoose.model("User", userSchema);

export default User;
