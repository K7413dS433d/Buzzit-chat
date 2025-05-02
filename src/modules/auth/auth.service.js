import { ioGetter } from "../../../index.js";
import models from "../../database/models/index.models.js";
import * as utils from "./../../utils/index.utils.js";

//signup
export const signUp = async (req, res, next) => {
  const { email, username } = req.body;

  //check email is exist
  const userExist = await models.User.findOne({
    $or: [{ email }, { username }],
  });

  if (userExist)
    return next(new Error("Email or username already exist ", { cause: 400 }));

  //create new user
  const newUser = new models.User(req.body);

  //generate otp
  const otpCode = utils.otpGenerator();

  //add otp to user
  const otp = models.OTP({ email, otp: otpCode });
  await otp.save();

  //send otp
  utils.emailEmitter.emit("sendEmail", { email, otp: otpCode });

  //save user
  await newUser.save();

  return res
    .status(201)
    .json({ success: true, message: "User created successfully" });
};

//login
export const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  //check exist
  const userExist = await models.User.findOne({ email });
  if (!userExist)
    return next(new Error("Invalid Email or password", { cause: 400 }));

  if (!userExist.isConfirmed)
    return next(new Error("Email not confirmed", { cause: 400 }));

  //check password
  if (!utils.compare({ data: password, hash: userExist.password }))
    return next(new Error("Invalid Email or password", { cause: 400 }));

  //token
  const tokens = utils.getTokens(userExist);

  //save
  await userExist.save();

  userExist.password = undefined;

  return res.status(200).json({
    success: true,
    message: "Login successfully",
    data: {
      user: userExist,
      ...tokens,
    },
  });
};

//confirm email
export const confirmEmail = async (req, res, next) => {
  const { otp, email } = req.body;

  //check user exist and not confirmed
  const userExist = await models.User.findOne({ email });
  if (!userExist) return next(new Error("User not found.", { cause: 404 }));

  //check if the user already confirmed
  if (userExist.isConfirmed === true)
    return next(new Error("Account already confirmed.", { cause: 409 }));

  //check user exist and not confirmed
  const otpExist = await models.OTP.findOne({ email });

  if (!otpExist || !utils.compare({ data: otp, hash: otpExist.otp }))
    return next(new Error("Wrong or Expired OTP.", { cause: 400 }));

  userExist.isConfirmed = true;
  await userExist.save();
  await otpExist.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "Email confirmed successfully" });
};

//confirm otp
export const confirmOTP = async (req, res, next) => {
  const { otp, email } = req.body;

  //check user exist and not confirmed
  const userExist = await models.User.findOne({ email });
  if (!userExist) return next(new Error("User not found.", { cause: 404 }));

  //check user exist and not confirmed
  const otpExist = await models.OTP.findOne({ email });

  if (!otpExist || !utils.compare({ data: otp, hash: otpExist.otp }))
    return next(new Error("Wrong or Expired OTP.", { cause: 400 }));

  return res.status(200).json({ success: true, message: "OTP is valid." });
};

//send otp
export const sendOTP = async (req, res, next) => {
  const { email } = req.body;

  //check exist
  const userExist = await models.User.findOne({ email });
  if (!userExist) return next(new Error("Email not exist.", { cause: 404 }));

  //generate otp
  const otp = utils.otpGenerator();

  //send otp
  utils.emailEmitter.emit("sendEmail", { email: userExist.email, otp });

  //add otp to user
  const otpCode = models.OTP({ otp, email });
  await otpCode.save();

  //save user
  await userExist.save();

  res.status(200).json({ success: true, message: "OTP send Successfully" });
};

//reset password
export const resetPassword = async (req, res, next) => {
  const { otp, password, email } = req.body;

  //check exist
  const userExist = await models.User.findOne({ email });
  if (!userExist) return next(new Error("Email not exist", { cause: 400 }));

  //get otp
  const otpExist = await models.OTP.findOne({ email });

  //check for valid otp
  if (!otpExist || !utils.compare({ data: otp, hash: otpExist.otp }))
    return next(new Error("Wrong or Expired OTP.", { cause: 400 }));

  //change the password
  userExist.password = password;
  await userExist.save();
  await otpExist.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
};
