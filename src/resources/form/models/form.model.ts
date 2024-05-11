import mongoose from "mongoose";
import { Form } from "../form.interface";
import { generateUniqueId } from "@/utils/others";

export interface FormDocument extends Form, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const formSchema = new mongoose.Schema(
  {
    flow_id: { type: String, unique: true },
    steps: { type: Array, required: true, default: [] },
    is_active: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate form_id
formSchema.pre<FormDocument>('save', function(next) {
  if (!this.flow_id) {
    this.flow_id = generateUniqueId();
  }
  next();
});

const FormModel = mongoose.model<FormDocument>("forms", formSchema);

export default FormModel;
