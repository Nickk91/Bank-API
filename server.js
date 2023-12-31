import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import usersRoutes from "./routes/usersRoutes.js";
import cors from "cors";

const app = express();

//cors middleware
app.use(cors());

//Middleware for JSON parsing

app.use(express.json());

// bank users routes

app.use("/api/v1/users", usersRoutes);

//Error handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running from port  ${PORT}`);
});
