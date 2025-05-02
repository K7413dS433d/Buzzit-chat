import { asyncHandler } from "../utils/index.utils.js";

export const isAuthorized = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.authUser.role))
      return next(new Error("Unauthorized User", { cause: 401 }));
    next();
  });
};
