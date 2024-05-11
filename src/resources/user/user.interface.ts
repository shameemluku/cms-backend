import { Document, Schema } from "mongoose";

export interface User {
  email: string;
  password: string;
  role: number;
  config?: {
    flow_id: string | null;
    config_ids: Array<string> | null;
  };
}

interface IEducationDetails {
  education_type: string | null;
  name_institution: string | null;
  edu_grade: string | null;
}

interface IProDetails {
  company_name: string | null;
  designation: string | null;
}

interface IUserDetails extends Document {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  gender: string | null;
  id_proof: string | null;
  education_details: IEducationDetails[];
  pro_details: IProDetails[];
  id_proof_upload: string | null;
  job_verification_doc: string | null;
  user_id: Schema.Types.ObjectId | null;
}

export { IEducationDetails, IProDetails, IUserDetails };
