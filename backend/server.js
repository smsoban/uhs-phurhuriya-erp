import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import studentRoutes from "./routes/students.js";
import staffRoutes from "./routes/staff.js";
import bonafideRoutes from "./routes/bonafide.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UHS Phurhuriya ERP Backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected"
  });
});

app.use("/api/students", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/bonafide", bonafideRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });