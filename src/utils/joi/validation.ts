import { Joi } from "celebrate";

export const numberQueryValidation = (fieldName = "", optional: boolean, min?: number) => {
    return Joi.string()
        .trim()
        .optional()
        .allow(optional && "")
        .custom((value, helpers) => {
            const limitAsNumber = parseInt(value, 10);

            if (isNaN(limitAsNumber)) {
                return helpers.error('number.base', { message: `${fieldName} should be a number` });
            }

            if (min) {
                if (limitAsNumber < min) {
                    return helpers.error('number.min', { message: `${fieldName} should be greater than or equal to ${min}` });
                }
            }

            return limitAsNumber;
        })
        .messages({
            'number.base': `${fieldName} should be a valid number`,
            'number.min': `${fieldName} should be greater than or equal to ${min}`
        });
}

