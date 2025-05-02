import { fileInputFields } from "../../common/constants/index.constants.js";
import { fileValidatorType } from "../../common/validators/index.validators.js";
import joi from "joi";

//update profile
export const updateProfile = joi
  .object({
    file: fileValidatorType(fileInputFields.profilePic),
    displayName: joi.string(),
  })
  .or("file", "displayName");
