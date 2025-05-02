import joi from "joi";
import { PASSWORD_REG } from "../../common/constants/index.constants.js";

//signup
export const signUp = joi
  .object({
    username: joi.string().required(),
    password: joi.string().pattern(PASSWORD_REG).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    email: joi.string().email().required(),
    profilePic: joi.object(),
  })
  .required();

//login
export const logIn = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

// send otp
export const sendOTP = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

//confirm email
export const confirmEmail = joi
  .object({
    email: joi.string().email().required(),
    otp: joi.string().required(),
  })
  .required();

//confirm email
export const confirmOTP = joi
  .object({
    email: joi.string().email().required(),
    otp: joi.string().required(),
  })
  .required();

//reset password
export const resetPassword = joi
  .object({
    otp: joi.string().required(),
    email: joi.string().email(),
    password: joi
      .string()
      .pattern(PASSWORD_REG)
      .message(
        "Must contain (8 - 64) uppercase, lowercase, number, special characters."
      )
      .required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
