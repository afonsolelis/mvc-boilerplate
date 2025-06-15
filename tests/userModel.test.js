const UserModel = require('../models/userModel');
const userFixtures = require('./fixtures/userFixtures');

describe('UserModel', () => {
  test('deve validar dados de usuário para criação', () => {
    const validData = { name: 'John Doe', email: 'john@example.com' };
    const result = UserModel.validate(validData);
    expect(result).toEqual(validData);
  });

  test('deve rejeitar dados inválidos para criação', () => {
    const invalidData = { name: '', email: 'invalid-email' };
    expect(() => UserModel.validate(invalidData)).toThrow('Erro de validação');
  });

  test('deve validar dados para atualização', () => {
    const validData = { name: 'John Doe Updated' };
    const result = UserModel.validate(validData, true);
    expect(result).toEqual(validData);
  });

  test('deve validar ID UUID', () => {
    const validUUID = userFixtures.validUUIDs.valid;
    expect(UserModel.validateId(validUUID)).toBe(validUUID);
    
    expect(() => UserModel.validateId('invalid')).toThrow('ID inválido');
    expect(() => UserModel.validateId('123')).toThrow('ID inválido');
    expect(() => UserModel.validateId('')).toThrow('ID é obrigatório');
    expect(() => UserModel.validateId(null)).toThrow('ID é obrigatório');
    expect(() => UserModel.validateId(undefined)).toThrow('ID é obrigatório');
  });

  test('deve validar email', () => {
    expect(UserModel.validateEmail('john@example.com')).toBe('john@example.com');
    expect(() => UserModel.validateEmail('invalid-email')).toThrow('Email inválido');
  });

  test('deve rejeitar nome muito curto', () => {
    const invalidData = { name: 'J', email: 'john@example.com' };
    expect(() => UserModel.validate(invalidData)).toThrow('Erro de validação');
  });

  test('deve rejeitar nome muito longo', () => {
    const invalidData = { 
      name: 'a'.repeat(101), 
      email: 'john@example.com' 
    };
    expect(() => UserModel.validate(invalidData)).toThrow('Erro de validação');
  });
});
