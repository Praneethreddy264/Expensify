import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import dbConnection from "./dbConfig/index.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8800;

dbConnection();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.use("*", (req, res) => {
  res.status(404).json({
    status: "404 Not Found",
    message: "Route Not Found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
