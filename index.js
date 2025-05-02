import express from "express";
import bootstrap from "./src/app.controller.js";
import setupSockets from "./src/modules/socket/socket.controller.js";
import { socketListener } from "./src/modules/socket/socket-handler/socket-listener.js";

const app = express();
const port = +process.env.PORT || 3000;

//test it work
app.get("/", (req, res) =>
  res.send(
    "app is running now if you found not working utilities do not call me just delete the app from khaled"
  )
);

//bootstrap calling
await bootstrap(express, app);

const httpServer = app.listen(port, () => {
  console.log("App is running on port", port);
});

//init socket
const io = setupSockets(httpServer);
io.on("connection", socketListener);
export const ioGetter = () => io;
