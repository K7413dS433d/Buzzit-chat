import { Router } from "express";
import * as authSchema from "./auth.validation.js";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/index.utils.js";
import { validateSchema } from "./../../middleware/index.middlewares.js";

const authRouter = Router();

authRouter.post(
  "/signup",
  validateSchema(authSchema.signUp),
  asyncHandler(authService.signUp)
);

authRouter.post(
  "/login",
  validateSchema(authSchema.logIn),
  asyncHandler(authService.logIn)
);

authRouter.post(
  "/confirm-email",
  validateSchema(authSchema.confirmEmail),
  asyncHandler(authService.confirmEmail)
);

authRouter.post(
  "/send-otp",
  validateSchema(authSchema.sendOTP),
  asyncHandler(authService.sendOTP)
);

authRouter.post(
  "/confirm-otp",
  validateSchema(authSchema.confirmOTP),
  asyncHandler(authService.confirmOTP)
);

authRouter.patch(
  "/reset-password",
  validateSchema(authSchema.resetPassword),
  asyncHandler(authService.resetPassword)
);

export default authRouter;
