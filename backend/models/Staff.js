import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: String,
    subject: String,
    role: {
      type: String,
      enum: ["admin", "headmaster", "teacher", "clerk", "staff"],
      default: "teacher"
    },
    mobile: String,
    email: String,
    gender: String,
    joiningDate: String,
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);