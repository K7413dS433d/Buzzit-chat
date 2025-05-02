import models from "../../database/models/index.models.js";
import * as utils from "./../../utils/index.utils.js";

export const updateProfile = async (req, res, next) => {
  const { displayName } = req.body;
  const { authUser } = req;

  //check display name
  const isDisplayNameExist = await models.User.findOne({ displayName });
  if (isDisplayNameExist)
    return next(
      new Error("Display name already exist, try another one.", { cause: 409 })
    );

  if (req.file) {
    const path = utils.pathResolver({ path: `${authUser.id}/coverPic` });
    const { secure_url, public_id } = await utils.uploadFile({
      req,
      options: { folder: path, fileName: "profilePic" },
    });
    authUser.profilePic.public_id = public_id;
    authUser.profilePic.secure_url = secure_url;
  }
  if (displayName) authUser.displayName = displayName;

  //save the
  await authUser.save();

  return res
    .status(200)
    .json({ success: true, message: "Profile updated successfully" });
};
