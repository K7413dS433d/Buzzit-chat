import mongoose, { Types } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },

  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

