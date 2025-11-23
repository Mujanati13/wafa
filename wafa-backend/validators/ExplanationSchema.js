import joi from 'joi';

const explanationSchema = joi.object({
    userId: joi.string()
        .required()
        .messages({
            'string.empty': 'User ID is required',
            'any.required': 'User ID is required'
        }),
    questionId: joi.string()
        .required()
        .messages({
            'string.empty': 'Question ID is required',
            'any.required': 'Question ID is required'
        }),
    title: joi.string()
        .required()
        .min(3)
        .max(200)
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title must be less than 200 characters',
            'any.required': 'Title is required'
        }),
    contentText: joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Content text must be a string'
        }),
    imageUrl: joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Image URL must be a string'
        }),
    status: joi.string()
        .valid('pending', 'approved', 'rejected')
        .default('pending')
        .messages({
            'any.only': 'Status must be one of: pending, approved, rejected'
        })
});

export default explanationSchema;
