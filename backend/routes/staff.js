import express from "express";
import Staff from "../models/Staff.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const staff = await Staff.find().sort({ createdAt: -1 });
  res.json({ success: true, data: staff });
});

router.post("/", async (req, res) => {
  const staff = await Staff.create(req.body);
  res.status(201).json({ success: true, data: staff });
});

router.put("/:id", async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json({ success: true, data: staff });
});

router.delete("/:id", async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Staff deleted" });
});

export default router;