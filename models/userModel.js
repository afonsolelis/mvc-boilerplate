const Joi = require('joi');

const userSchema = Joi.object({
  id: Joi.string().uuid(),
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
    if (!id || typeof id !== 'string') {
      throw new Error('ID é obrigatório');
    }
    
    // UUID v4 regex pattern
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      throw new Error('ID inválido - deve ser um UUID válido');
    }
    
    return id;
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
