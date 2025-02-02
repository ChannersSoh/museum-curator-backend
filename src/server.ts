import app from "./app";
import { Server } from "http";

export function startServer(port: number = 5000): Server {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}