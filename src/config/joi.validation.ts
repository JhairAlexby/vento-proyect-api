import * as Joi from 'joi';

export const joiValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('dev', 'production', 'test')
        .default('dev'),
    PORT: Joi.number().default(3000),
    MONGODB: Joi.string().required(),
    JWT_SECRET: Joi.string().required().min(32),
    FRONTEND_URL: Joi.string().default('http://localhost:3000'),
    DEFAULT_LIMIT: Joi.number().default(10),
});