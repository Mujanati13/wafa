import joi from 'joi';

const optionSchema = joi.object({
    text: joi.string().required().messages({
        'string.base': 'Option text must be a string',
        'any.required': 'Option text is required'
    }),
    isCorrect: joi.boolean().required().messages({
        'boolean.base': 'isCorrect must be a boolean',
        'any.required': 'isCorrect is required'
    })
});

const createQuestionSchema = joi.object({
    examId: joi.string().required().messages({
        'string.base': 'examId must be a string',
        'any.required': 'examId is required'
    }),
    text: joi.string().required().messages({
        'string.base': 'text must be a string',
        'any.required': 'text is required'
    }),
    options: joi.array().items(optionSchema).min(2).required().messages({
        'array.base': 'options must be an array',
        'array.min': 'options must contain at least 2 items',
        'any.required': 'options are required'
    }),
    note: joi.string().allow('', null),
    images: joi.array().items(joi.string().uri()).default([]),
    sessionLabel: joi.string().required().messages({
        'string.base': 'sessionLabel must be a string',
        'any.required': 'sessionLabel is required'
    })
});

const updateQuestionSchema = joi.object({
    examId: joi.string(),
    text: joi.string(),
    options: joi.array().items(optionSchema).min(2),
    note: joi.string().allow('', null),
    images: joi.array().items(joi.string().uri())
});

export default { createQuestionSchema, updateQuestionSchema };


