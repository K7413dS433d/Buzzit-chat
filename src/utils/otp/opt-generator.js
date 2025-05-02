import generator from "otp-generator";

export const otpGenerator = () =>
  generator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
