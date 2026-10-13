import mongoose from "mongoose";

const bonafideSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, required: true, unique: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    purpose: String,
    issuedBy: String,
    issuedRole: String,
    issueDate: {
      type: Date,
      default: Date.now
    },
    session: { type: String, default: "2026-27" }
  },
  { timestamps: true }
);

export default mongoose.model("Bonafide", bonafideSchema);