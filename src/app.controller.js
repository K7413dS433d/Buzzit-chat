import { rateLimit } from "express-rate-limit";
import cors from "cors";
import connectDB from "./database/connection.js";
import routers from "./modules/index.routers.js";
import { globalError, notFound } from "./utils/index.utils.js";

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, //default 1 min
  limit: 6, //default 5
});

const bootstrap = async (express, app) => {
  //database connection
  await connectDB();

  //rate limit
  //app.use(limiter);

  //cors
  app.use(cors());

  //body parser
  app.use(express.json());

  //auth
  app.use("/auth", routers.authRouter);

  //user
  app.use("/user", routers.userRouter);

  //not found path
  app.all("*", notFound);

  //global error handling
  app.use(globalError);
};

export default bootstrap;
