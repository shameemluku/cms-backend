import { celebrate, Joi } from "celebrate";

const createUserValidation = celebrate({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  }),
});

const LoginUserValidation = celebrate({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

const userDetailsValidation = celebrate({
  body: Joi.object({
    user_id: Joi.string().required(),
    first_name: Joi.string().allow(""),
    last_name: Joi.string().allow(""),
    address: Joi.string().allow(""),
    gender: Joi.string().allow(""),
    id_proof: Joi.string().allow(""),
    education_details: Joi.array().items(
      Joi.object({
        education_type: Joi.string().allow(""),
        name_institution: Joi.string().allow(""),
        edu_grade: Joi.string().allow(""),
      })
    ),
    pro_details: Joi.array().items(
      Joi.object({
        company_name: Joi.string().allow(""),
        designation: Joi.string().allow(""),
      })
    ),
    id_proof_upload: Joi.string().allow(""),
    job_verification_doc: Joi.string().allow(""),
  }),
});


const validateUserId = celebrate({
  query: Joi.object({
    user_id: Joi.string().required(),
  }),
});

const validateDocKey = celebrate({
  query: Joi.object({
    key: Joi.string().required(),
  }),
});


export default {
  createUserValidation,
  LoginUserValidation,
  userDetailsValidation,
  validateUserId,
  validateDocKey
};
