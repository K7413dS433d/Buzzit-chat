import { Server } from "socket.io";
import { socketIsAuthenticated } from "../../middleware/index.middlewares.js";

const setupSockets = (httpServer) => {
  //establish connection
  const io = new Server(httpServer, { cors: "*" });

  // Middleware for authentication and authorization
  io.use(socketIsAuthenticated());
  //listen to event
  return io;
};

export default setupSockets;
