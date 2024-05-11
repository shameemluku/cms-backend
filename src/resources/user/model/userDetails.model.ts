import { Schema, model } from "mongoose";
import { IUserDetails } from "../user.interface";

const educationDetailsSchema: Schema = new Schema(
  {
    education_type: { type: String, default: null },
    name_institution: { type: String, default: null },
    edu_grade: { type: String, default: null },
  },
  { _id: false }
);

const proDetailsSchema: Schema = new Schema(
  {
    company_name: { type: String, default: null },
    designation: { type: String, default: null },
  },
  { _id: false }
);

const detailsSchema: Schema<IUserDetails> = new Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  address: { type: String, default: null },
  gender: { type: String, default: null },
  id_proof: { type: String, default: null },
  education_details: [educationDetailsSchema],
  pro_details: [proDetailsSchema],
  id_proof_upload: { type: String, default: null },
  job_verification_doc: { type: String, default: null },
  user_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
});

const UserDetailsModel = model<IUserDetails>("user-details", detailsSchema);

export default UserDetailsModel;
