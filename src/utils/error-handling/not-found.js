export const notFound = (req, res, next) => {
  return next(new Error("Not Found Path", { cause: 404 }));
};
