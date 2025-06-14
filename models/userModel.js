const Joi = require('joi');

const userSchema = Joi.object({
  id: Joi.number().integer().positive(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required()
});

const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email()
}).min(1);

class UserModel {
  static validate(userData, isUpdate = false) {
    const schema = isUpdate ? userUpdateSchema : userCreateSchema;
    const { error, value } = schema.validate(userData);
    if (error) {
      throw new Error(`Erro de validação: ${error.details[0].message}`);
    }
    return value;
  }

  static validateId(id) {
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      throw new Error('ID inválido');
    }
    return parseInt(id);
  }

  static validateEmail(email) {
    const { error } = Joi.string().email().validate(email);
    if (error) {
      throw new Error('Email inválido');
    }
    return email;
  }
}

module.exports = UserModel;
