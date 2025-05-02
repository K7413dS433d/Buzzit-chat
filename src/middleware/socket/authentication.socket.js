import models from "../../database/models/index.models.js";
import { verifyToken } from "../../utils/index.utils.js";

export const socketIsAuthenticated = (bearerKey = process.env.BEARER_KEY) => {
  return async (socket, next) => {
    try {
      // console.log(socket.handshake.headers.authorization)

      const auth = socket.handshake.auth.authorization;
      if (!auth) return next(new Error("Unauthorized access!", { cause: 401 }));

      if (!auth.startsWith(bearerKey)) {
        return next(
          new Error("Invalid token. Please provide a valid bearer token.", 400)
        );
      }
      const [_, token] = auth.split(" ");
      const decodedToken = verifyToken({ token });
      const authUser = await models.User.findById(decodedToken.id);
      if (!authUser) return next(new Error("Unauthorized", { cause: 401 }));

      socket.authUser = authUser;
      socket.id = authUser.id;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
