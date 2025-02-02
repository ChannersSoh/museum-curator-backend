import app from "./app";
import { createServer, Server } from "http";

const PORT = process.env.PORT || 5000;

export function startServer(port: number = Number(PORT)): Server {
  const server = createServer(app);

  server.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}
