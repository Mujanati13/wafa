import joi from 'joi';

const examParYearSchema = joi.object({
    name: joi.string().required().messages({
        'string.base': 'Name must be a string',
        'any.required': 'Name is required'
    }),
    // moduleId: joi.string().required().messages({
    //     'string.base': 'Module ID must be a string',
    //     'any.required': 'Module ID is required'
    // }),
    year: joi.number().required().messages({
        'number.base': 'Year must be a number',
        'any.required': 'Year is required'
    }),
    imageUrl: joi.string().uri().required().messages({
        'string.base': 'Image URL must be a string',
        'string.uri': 'Image URL must be a valid URI',
        'any.required': 'Image URL is required'
    }),
    infoText: joi.string().required().messages({
        'string.base': 'Info text must be a string',
        'any.required': 'Info text is required'
    })
});

export default examParYearSchema;
