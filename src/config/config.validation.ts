import * as Joi from 'joi';

export default () =>
  Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
    DB_HOST: Joi.string().default('localhost'),
    DB_USERNAME: Joi.string().optional(),
    DB_PASSWORD: Joi.string().optional(),
    DB_NAME: Joi.string().default('test'),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_USERNAME: Joi.string().default('guest'),
    REDIS_PASSWORD: Joi.string().default('guest'),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
  });
