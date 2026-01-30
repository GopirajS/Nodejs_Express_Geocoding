const Joi = require("joi");

exports.registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.subscribeSchema = Joi.object({
  plan_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'plan_id must be a valid ObjectId'
  }),
  start_date: Joi.date().iso().required(),
});

exports.weatherSchema = Joi.object({
  location: Joi.string().min(2).max(100).required(),
});
