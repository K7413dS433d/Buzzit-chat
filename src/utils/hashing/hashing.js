import bcrypt from "bcryptjs";

export const hash = ({ data, saltRound = +process.env.SALT_ROUND }) => {
  return bcrypt.hashSync(data, saltRound);
};

export const compare = ({ data, hash }) => {
  return bcrypt.compareSync(data, hash);
};
