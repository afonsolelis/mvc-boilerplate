const UserModel = require('../models/userModel');

class UserService {
  constructor(userRepository) {
    if (!userRepository) {
      throw new Error('UserRepository é obrigatório');
    }
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    try {
      const users = await this.userRepository.findAll();
      return users || [];
    } catch (error) {
      if (error.message.includes('conexão') || error.message.includes('banco')) {
        throw new Error('Erro de conexão com o banco de dados');
      }
      throw new Error(`Erro no serviço ao obter usuários: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const validatedId = UserModel.validateId(id);
      const user = await this.userRepository.findById(validatedId);
      return user || null;
    } catch (error) {
      if (error.message.includes('ID inválido')) {
        throw error;
      }
      if (error.message.includes('conexão') || error.message.includes('banco')) {
        throw new Error('Erro de conexão com o banco de dados');
      }
      throw new Error(`Erro no serviço ao obter usuário: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      if (!userData || typeof userData !== 'object') {
        throw new Error('Dados do usuário são obrigatórios');
      }

      const validatedData = UserModel.validate(userData);
      
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new Error('Usuário com este email já existe');
      }
      
      const newUser = await this.userRepository.create(validatedData);
      if (!newUser) {
        throw new Error('Falha ao criar usuário');
      }
      
      return newUser;
    } catch (error) {
      if (error.message.includes('validação') || 
          error.message.includes('já existe') ||
          error.message.includes('obrigatório')) {
        throw error;
      }
      if (error.message.includes('conexão') || error.message.includes('banco')) {
        throw new Error('Erro de conexão com o banco de dados');
      }
      throw new Error(`Erro no serviço ao criar usuário: ${error.message}`);
    }
  }

  async updateUser(id, userData) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      if (!userData || typeof userData !== 'object' || Object.keys(userData).length === 0) {
        throw new Error('Dados para atualização são obrigatórios');
      }

      const validatedId = UserModel.validateId(id);
      const validatedData = UserModel.validate(userData, true);
      
      const existingUser = await this.userRepository.findById(validatedId);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      if (validatedData.email && validatedData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(validatedData.email);
        if (userWithEmail && userWithEmail.id !== validatedId) {
          throw new Error('Email já está em uso por outro usuário');
        }
      }

      const updatedUser = await this.userRepository.update(validatedId, validatedData);
      if (!updatedUser) {
        throw new Error('Falha ao atualizar usuário');
      }

      return updatedUser;
    } catch (error) {
      if (error.message.includes('validação') || 
          error.message.includes('não encontrado') ||
          error.message.includes('já está em uso') ||
          error.message.includes('obrigatório') ||
          error.message.includes('ID inválido')) {
        throw error;
      }
      if (error.message.includes('conexão') || error.message.includes('banco')) {
        throw new Error('Erro de conexão com o banco de dados');
      }
      throw new Error(`Erro no serviço ao atualizar usuário: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      if (!id) {
        throw new Error('ID é obrigatório');
      }

      const validatedId = UserModel.validateId(id);
      
      const existingUser = await this.userRepository.findById(validatedId);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }
      
      const deletedUser = await this.userRepository.delete(validatedId);
      if (!deletedUser) {
        throw new Error('Falha ao deletar usuário');
      }

      return deletedUser;
    } catch (error) {
      if (error.message.includes('não encontrado') ||
          error.message.includes('obrigatório') ||
          error.message.includes('ID inválido')) {
        throw error;
      }
      if (error.message.includes('conexão') || error.message.includes('banco')) {
        throw new Error('Erro de conexão com o banco de dados');
      }
      throw new Error(`Erro no serviço ao deletar usuário: ${error.message}`);
    }
  }
}

module.exports = UserService;
