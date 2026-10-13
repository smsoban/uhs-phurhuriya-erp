import express from "express";
import Bonafide from "../models/Bonafide.js";
import Student from "../models/Student.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const certificates = await Bonafide.find()
    .populate("student")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: certificates });
});

router.post("/", async (req, res) => {
  const { studentId, purpose, issuedBy, issuedRole, session } = req.body;

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found" });
  }

  const count = await Bonafide.countDocuments();
  const certificateNo = `UHS-BON-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const certificate = await Bonafide.create({
    certificateNo,
    student: studentId,
    purpose,
    issuedBy,
    issuedRole,
    session
  });

  const fullCertificate = await Bonafide.findById(certificate._id).populate("student");

  res.status(201).json({
    success: true,
    data: fullCertificate
  });
});

router.get("/:id", async (req, res) => {
  const certificate = await Bonafide.findById(req.params.id).populate("student");

  if (!certificate) {
    return res.status(404).json({ success: false, message: "Certificate not found" });
  }

  res.json({ success: true, data: certificate });
});

export default router;