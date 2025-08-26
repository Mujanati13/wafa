import joi from 'joi';

const createReportSchema = joi.object({
    userId: joi.string().required().messages({
        'any.required': 'userId is required'
    }),
    questionId: joi.string().required().messages({
        'any.required': 'questionId is required'
    }),
    details: joi.string().min(5).required().messages({
        'string.min': 'details must be at least 5 characters',
        'any.required': 'details is required'
    }),
    status: joi.string().valid('pending', 'resolved', 'rejected').default('pending')
});

const updateReportSchema = joi.object({
    userId: joi.string(),
    questionId: joi.string(),
    details: joi.string().min(5),
    status: joi.string().valid('pending', 'resolved', 'rejected')
});

export default { createReportSchema, updateReportSchema };


