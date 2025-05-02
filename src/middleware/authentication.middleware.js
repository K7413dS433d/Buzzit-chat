import models from "./../database/models/index.models.js";
import { asyncHandler, verifyToken } from "../utils/index.utils.js";

export const isAuthenticated = (bearerKey = process.env.BEARER_KEY) => {
  return asyncHandler(async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next(new Error("Unauthorized access!", { cause: 401 }));

    if (!auth.startsWith(bearerKey)) {
      return next(
        new Error("Invalid token. Please provide a valid bearer token.", 400)
      );
    }
    const [_, token] = auth.split(" ");
    const decodedToken = verifyToken({ token });

    const authUser = await models.User.findById(decodedToken.id);
    if (!authUser) return next(new Error("Unauthorized user", { cause: 401 }));

    req.authUser = authUser;
    next();
  });
};
