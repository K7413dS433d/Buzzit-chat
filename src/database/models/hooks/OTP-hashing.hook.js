import { hash } from "../../../utils/index.utils.js";


export function hashOTP(next, doc){
  this.otp = hash({ data: this.otp });
  return next();
}
