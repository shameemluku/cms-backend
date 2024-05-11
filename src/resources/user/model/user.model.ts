import mongoose from "mongoose";
import { User } from "../user.interface";

export interface userDocument extends User, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: Number },
    config: {
      flow_id: { type: String, default: null },
      config_ids: { type: Array, default: null },
    },
    details: { type: mongoose.Schema.Types.ObjectId, ref: "user-details" },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<userDocument>("users", userSchema);

export default userModel;
