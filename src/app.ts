import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;