import joi from 'joi';

const examParYearSchema = joi.object({
    name: joi.string().required().messages({
        'string.base': 'Name must be a string',
        'any.required': 'Name is required'
    }),
    moduleId: joi.string().required().messages({
        'string.base': 'Module ID must be a string',
        'any.required': 'Module ID is required'
    }),
    year: joi.number().required().messages({
        'number.base': 'Year must be a number',
        'any.required': 'Year is required'
    }),
    imageUrl: joi.string().uri().allow('').messages({
        'string.base': 'Image URL must be a string',
        'string.uri': 'Image URL must be a valid URI'
    }),
    infoText: joi.string().allow('').messages({
        'string.base': 'Info text must be a string'
    })
});

const updateExamParYearSchema = joi.object({
    name: joi.string().messages({
        'string.base': 'Name must be a string'
    }),
    moduleId: joi.string().messages({
        'string.base': 'Module ID must be a string'
    }),
    year: joi.number().messages({
        'number.base': 'Year must be a number'
    }),
    imageUrl: joi.string().uri().messages({
        'string.base': 'Image URL must be a string',
        'string.uri': 'Image URL must be a valid URI'
    }),
    infoText: joi.string().messages({
        'string.base': 'Info text must be a string'
    })
});

export default { examParYearSchema, updateExamParYearSchema };
