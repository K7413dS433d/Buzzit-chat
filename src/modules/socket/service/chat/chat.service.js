import models from "./../../../../database/models/index.models.js";
import { ioGetter } from "./../../../../../index.js";

// get all user chats
export const getAllChats = async (socket) => {
  try {
    const userId = socket.id;

    // 1. Get all chats where the user is a participant
    const allChats = await models.Chat.find({
      participants: { $in: [userId] },
    }).populate("participants", "username profilePic");
    
    if (allChats.length === 0) {
      return socket.emit("get_chats", { data: [], message: "No chats found." });
    }
    
    // 2. Build chat info
    const chatDetails = await Promise.all(
      allChats.map(async (chat) => {
        // Get the other participant
        const otherUser = chat.participants.find(
          (user) => user._id.toString() !== userId.toString()
        );

        // Get the last message
        const lastMessage = await models.Message.findOne({ chat: chat._id })
          .sort({ createdAt: -1 })
          .select("message createdAt");

        // Count unseen messages from the other user
        const unseenCount = await models.Message.countDocuments({
          chat: chat._id,
          senderId: otherUser._id,
          seen: false,
        });

        return {
          chatId: chat._id,
          user: {
            _id: otherUser._id,
            username: otherUser.username,
            profilePic: otherUser.profilePic?.secure_url || null,
          },
          lastMessage,
          unseenCount,
        };
      })
    );

    // 3. Emit the result
    socket.emit("get_chats", { data: chatDetails });
  } catch (err) {
    console.error("Error in getAllChats:", err);
    socket.emit("socket_Error", "Unable to fetch chats");
  }
};

// receive message from a user
export const receiveMessage = async (socket, { message, to }) => {
  try {
    const senderId = socket.id;

    // 1. Check if recipient exists
    const userExist = await models.User.findById(to);
    if (!userExist) {
      return socket.emit("socket_Error", "User not found");
    }

    // 2. Check if chat already exists between sender and receiver
    let chat = await models.Chat.findOne({
      participants: { $all: [senderId, to] },
    });

    // 3. Create chat if it doesn't exist
    if (!chat) {
      chat = await models.Chat.create({
        participants: [senderId, to],
      });
    }

    // 4. Create new message
    const newMessage = await models.Message.create({
      chat: chat._id,
      senderId,
      message,
      receivedAt: Date.now(),
    });

    // 5. Populate sender info if needed
    const fullMessage = await models.Message.findById(newMessage._id).populate({
      path: "senderId",
      model: "User",
      select: "username profilePic displayName",
    });

    // 6. Emit back to sender
    socket.emit("send_message", fullMessage);
    //7. Emit to target user
    if (socket.id != to) ioGetter().to(to).emit("send_message", fullMessage);
  } catch (err) {
    console.error("Error in receiveMessage:", err);
    socket.emit("socket_Error", "Internal server error");
  }
};

// if chat exists, get messages from it and if not exist create new chat and the messages are null(get chat by user id)
export const getChat = async (socket, { userId }) => {
  try {
    const currentUserId = socket.id;

    // check user exists
    if (!(await models.User.findById(userId)))
      return socket.emit("socket_Error", "User not found");

    // Find or create chat
    let chat = await models.Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      chat = await models.Chat.create({
        participants: [currentUserId, userId],
      });
    }

    // Fetch messages
    const allMessages = await models.Message.find({ chat: chat._id })
      .populate("senderId", "username")
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark unseen messages as seen
    const unseenMessages = allMessages.filter(
      (msg) => !msg.seen && msg.senderId._id.toString() !== currentUserId
    );
    await Promise.all(
      unseenMessages.map((msg) => {
        msg.seen = true;
        return msg.save();
      })
    );

    const messages = allMessages.map((msg) => ({
      _id: msg._id,
      chatId: msg.chat,
      content: msg.message,
      sender: {
        _id: msg.senderId._id,
        username: msg.senderId.username,
      },
      createdAt: msg.createdAt,
      seen: msg.seen,
    }));

    socket.emit("open_chat", { chatId: chat._id, messages });
  } catch (error) {
    console.error("Error in getMessages:", error);
    socket.emit("socket_Error", "Unable to fetch messages");
  }
};

// user can delete a message that he sent
export const deleteMessage = async (socket, { messageId }) => {
  try {
    // check message existence
    const messageExist = await models.Message.findById(messageId);
    if (!messageExist) return socket.emit("socket_Error", "Message not found");

    // check if the user is the sender of this message
    if (messageExist.senderId.toString() !== socket.id.toString()) {
      return socket.emit("socket_Error", "Unauthorized delete");
    }
    // delete the message
    await messageExist.deleteOne();

    socket.emit("delete_message", {
      status: "deleted",
      messageId,
      deletedAt: Date.now(),
    });
  } catch (err) {
    console.error("Error deleting message as seen:", err);
    socket.emit("socket_Error", "Unable to delete message");
  }
};

// user can edit a message that he sent
export const editMessage = async (socket, { messageId, newMessage }) => {
  try {
    // check message existence
    const messageExist = await models.Message.findById(messageId);
    if (!messageExist) return socket.emit("socket_Error", "Message not found");

    // check if the user is the sender
    if (messageExist.senderId.toString() !== socket.id.toString()) {
      return socket.emit("socket_Error", "Unauthorized edit");
    }
    // update the message
    await messageExist.updateOne({ message: newMessage });

    socket.emit("edit_message", {
      status: "edited",
      messageId,
      newMessage,
      editedAt: messageExist.updatedAt,
    });
  } catch (err) {
    console.error("Error in editMessage:", err);
    socket.emit("socket_Error", "Unable to edit message");
  }
};

// when user start typing the other user will see that he is typing
export const startTyping = async (socket, { chatId }) => {
  try {
    // check chat existence
    const chatExist = await models.Chat.findById(chatId);
    if (!chatExist) return socket.emit("socket_Error", "Chat not found");

    // check if user is part of the chat
    if (!chatExist.participants.includes(socket.id)) {
      return socket.emit("socket_Error", "Unauthorized access");
    }

    // get the id of the other use in the chat
    const otherUser = chatExist.participants.find(
      (participant) => participant.toString() !== socket.id.toString()
    );

    // emit typing event to the other user in the chat
    socket.to(otherUser.toString()).emit("start_typing", {
      Typing: true,
      chatId,
      userWhoIsTyping: socket.id,
    });
  } catch (err) {
    console.error("Error in startTyping:", err);
    socket.emit("socket_Error", "Unable to start typing");
  }
};

// when user stop typing the other user will see that
export const stopTyping = async (socket, { chatId }) => {
  try {
    // check chat existence
    const chat = await models.Chat.findById(chatId);
    if (!chat) {
      return socket.emit("socket_Error", "Chat not found");
    }

    // check if user is part of the chat
    if (!chat.participants.includes(socket.id)) {
      return socket.emit("socket_Error", "Unauthorized access");
    }

    // get the id of the other user in the chat
    const otherUser = chat.participants.find(
      (participant) => participant.toString() !== socket.id.toString()
    );

    // emit stop_typing event to the other user
    socket
      .to(otherUser.toString())
      .emit("stop_typing", { chatId, userWhoStoppedTyping: socket.id });
  } catch (err) {
    console.error("Error in stopTyping:", err);
    socket.emit("socket_Error", "Unable to stop typing");
  }
};

// get connected users
export const getConnectedUsers = (socket, connectedUsers) => {
  try {
    socket.broadcast.emit("connected_users", connectedUsers);
  } catch (err) {
    console.error("Error in stopTyping:", err);
    socket.emit("socket_Error", "Unable to stop typing");
  }
};
