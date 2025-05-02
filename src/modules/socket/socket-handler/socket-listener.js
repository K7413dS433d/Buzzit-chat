import { ioGetter } from "../../../../index.js";
import {
  getConnectedUsers,
  deleteMessage,
  editMessage,
  getAllChats,
  getChat,
  receiveMessage,
  startTyping,
  stopTyping,
} from "../service/chat/chat.service.js";

//connected users container
let connectedUsers = new Set();

//?socket listener
export const socketListener = async (socket) => {
  try {
    //get connected users
    connectedUsers.add(socket.id);

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      // Broadcast the updated list of connected users to all clients
      return getConnectedUsers(socket, Array.from(connectedUsers));
    });

    socket.on("connected_users", () =>
      getConnectedUsers(socket, Array.from(connectedUsers))
    );

    socket.on("get_chats", () => getAllChats(socket));

    socket.on("send_message", (data) => receiveMessage(socket, data));

    socket.on("open_chat", (data) => getChat(socket, data));

    socket.on("delete_message", (data) => deleteMessage(socket, data));

    socket.on("edit_message", (data) => editMessage(socket, data));

    socket.on("start_typing", (data) => startTyping(socket, data));

    socket.on("stop_typing", (data) => stopTyping(socket, data));
  } catch (error) {
    console.error("Socket error:", error.message);
    socket.emit("socket_error", {
      success: false,
      status: error.cause,
      message: error.message,
    });
  }

  return socket;
};
