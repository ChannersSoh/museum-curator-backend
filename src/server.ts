import app from "./app";
import { Server } from "http";

const PORT = parseInt(process.env.PORT || "5000", 10);

export function startServer(port: number = PORT): Server {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}