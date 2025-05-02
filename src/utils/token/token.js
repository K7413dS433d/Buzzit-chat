import jwt from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  secretKey = process.env.JWT_SECRET,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey = process.env.JWT_SECRET }) => {
  return jwt.verify(token, secretKey);
};

export const getTokens = (user) => {
  //generate tokens
  const access_token = generateToken({
    payload: { id: user.id },
    options: { expiresIn: process.env.ACCESS_TOKEN_EXP },
  });

  const refresh_token = generateToken({
    payload: { id: user.id },
    options: { expiresIn: process.env.REFRESH_TOKEN_EXP },
  });

  return { access_token };
};
