import CryptoJS from "crypto-js";

export const encrypt = ({ data, secret = process.env.ENCRYPTION_KEY }) => {
  return CryptoJS.AES.encrypt(data, secret).toString();
};

export const decrypt = ({
  cipherData,
  secret = process.env.ENCRYPTION_KEY,
}) => {
  return CryptoJS.AES.decrypt(cipherData, secret).toString(CryptoJS.enc.Utf8);
};
