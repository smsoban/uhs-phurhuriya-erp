import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json({ success: true, data: students });
});

router.get("/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found" });
  }
  res.json({ success: true, data: student });
});

router.post("/", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json({ success: true, data: student });
});

router.put("/:id", async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.json({ success: true, data: student });
});

router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Student deleted" });
});

export default router;