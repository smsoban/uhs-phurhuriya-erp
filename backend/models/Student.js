import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNo: String,
    name: { type: String, required: true },
    fatherName: String,
    motherName: String,
    dateOfBirth: String,
    gender: String,
    className: String,
    section: String,
    rollNo: String,
    session: { type: String, default: "2026-27" },
    apaarId: String,
    penNo: String,
    eshikshakoshId: String,
    address: String,
    mobile: String,
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);