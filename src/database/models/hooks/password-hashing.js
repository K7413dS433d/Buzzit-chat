import { hash } from "../../../utils/index.utils.js";

export function hashPassword(next, doc) {
  if (this.isModified("password")) {
    this.password = hash({ data: this.password });
  }

  return next();
}
