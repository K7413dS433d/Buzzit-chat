export const socketIsAuthorized = (...roles) => {
  return (socket, next) => {
    if (!roles.includes(socket.authUser.role))
      return next(new Error("Unauthorized User", { cause: 401 }));
    return next();
  };
};
