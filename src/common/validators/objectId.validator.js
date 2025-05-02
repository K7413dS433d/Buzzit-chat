import joi from "joi";
import { isValidObjectId } from "mongoose";

const objectIdValidator = (value, helper) => {
  if (isValidObjectId(value)) return true;
  return helper.message("invalid id");
};

export const objectIdType = joi.custom(objectIdValidator);
