import { Router } from "express";
import * as userSchema from "./user.validation.js";
import * as userService from "./user.service.js";
import { asyncHandler } from "../../utils/index.utils.js";
import {
  validateSchema,
  isAuthenticated,
  singleUploader,
} from "./../../middleware/index.middlewares.js";
import {
  extensions,
  fileInputFields,
} from "../../common/constants/file-metadata.js";

const userRouter = Router();

userRouter.patch(
  "/update-profile",
  isAuthenticated(),
  singleUploader({
    fieldName: fileInputFields.profilePic,
    allowedExtensions: extensions.IMAGES,
  }),
  validateSchema(userSchema.updateProfile),
  asyncHandler(userService.updateProfile)
);

export default userRouter;
