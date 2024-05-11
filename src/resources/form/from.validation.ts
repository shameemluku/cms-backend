import { celebrate, Joi } from "celebrate";

const validateFormData = celebrate({
  body: Joi.object({
    form_data: Joi.array()
      .items(
        Joi.object({
          form_id: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string().required(),
          theme: Joi.string().required(),
        })
      )
      .required(),
  }),
});

const validateFieldData = celebrate({
  body: Joi.object({
    parent_id: Joi.string().required(),
    fields: Joi.array()
      .items(
        Joi.object({
          _id: Joi.string().optional(),
          type: Joi.string()
            .valid("text", "text_area", "radio", "select", "number", "document")
            .required(),
          label: Joi.string().required(),
          name: Joi.string().required(),
          className: Joi.string().allow(""),
          required: Joi.boolean().required(),
          enabled: Joi.boolean().required(),
          values: Joi.when("type", {
            is: Joi.string().valid("radio", "select"),
            then: Joi.array()
              .items(
                Joi.object({
                  value: Joi.string().required(),
                  label: Joi.string().required(),
                  _id: Joi.string().optional(),
                })
              )
              .required(),
            otherwise: Joi.array().allow(null),
            
          }),
        })
      )
      .required(),
    file_included: Joi.boolean().required(),
    other_config: Joi.object({
      loop: Joi.boolean().required(),
      limit: Joi.number().allow(null),
      max_file_size: Joi.number().allow(null),
      file_types: Joi.array().items(Joi.string().allow(null)).allow(null),
    }).required(),
  }),
});

const validateParentId = celebrate({
  query: Joi.object({
    parent_id: Joi.string().required(),
  }),
});

export default { validateFormData, validateFieldData, validateParentId };
