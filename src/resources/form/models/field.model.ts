import { generateUniqueId } from "@/utils/others";
import { Document, Schema, model } from "mongoose";

const ValueSchema = new Schema(
  {
    value: String,
    label: String,
  },
  { _id: false }
);

const FieldItemSchema = new Schema(
  {
    type: String,
    label: String,
    name: String,
    className: String,
    required: Boolean,
    enabled: Boolean,
    values: [ValueSchema],
  },
  { _id: false }
);

export interface FieldDocument extends Document {
  config_id: string;
  parent_id: string;
  fields: (typeof FieldItemSchema)[];
  file_included: boolean;
  other_config: {
    loop: boolean;
    limit: number | null;
    max_file_size: number | null;
    file_types: Array<string> | null;
  };
  is_active: boolean;
}

const FieldSchema = new Schema<FieldDocument>({
  config_id: { type: String, unique: true },
  parent_id: String,
  fields: [FieldItemSchema],
  file_included: Boolean,
  other_config: {
    loop: Boolean,
    limit: { type: Number, default: null },
    max_file_size: { type: Number, default: null },
    file_types: { type: Array, default: null },
  },
  is_active: { type: Boolean, required: true, default: false },
});

// Pre-save hook to generate config_id
FieldSchema.pre("save", function (this: FieldDocument, next) {
  if (!this.config_id) {
    // Generate config_id using a unique identifier method, like UUID or a combination of timestamp and random value
    this.config_id = generateUniqueId();
  }
  next();
});

const FieldModel = model<FieldDocument>("fields", FieldSchema);

export default FieldModel;
