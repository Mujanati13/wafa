import joi from 'joi';

const moduleSchema = joi.object({
    name: joi.string().min(3).max(100).required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name must be at most 100 characters',
            'any.required': 'Name is required'
        }),
    semester: joi.string()
        .valid('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10')
        .required()
        .messages({
            'string.empty': 'Semester cannot be empty',
            'any.required': 'Semester is required',
            'any.only': 'Semester must be one of: S1, S2, S3, S4, S5, S6, S7, S8, S9, S10'
        }),
    imageUrl: joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Image URL must be a string'
        }),
    infoText: joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Info text must be a string'
        }),
    color: joi.string()
        .allow('')
        .optional(),
    helpContent: joi.string()
        .allow('')
        .optional(),
    difficulty: joi.string()
        .valid('easy', 'medium', 'hard')
        .default('medium')
        .optional(),
    contentType: joi.string()
        .valid('url', 'text')
        .default('url')
        .optional(),
    textContent: joi.string()
        .allow('')
        .optional()
});

export default moduleSchema;
