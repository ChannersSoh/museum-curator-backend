import app from "./app";
import { createServer, Server } from "http";

const PORT = process.env.PORT || "10000"; 

function startServer(port: number = parseInt(PORT, 10)): Server {
  const server = createServer(app);

  server.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
  });

  server.on("error", (err) => {
    console.error("Server Error:", err);
  });

  return server;
}

startServer();
