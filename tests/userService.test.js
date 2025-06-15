const UserService = require('../services/userService');
const userFixtures = require('./fixtures/userFixtures');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    // Mock do UserRepository
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    userService = new UserService(mockUserRepository);
  });

  describe('getAllUsers', () => {
    test('deve retornar todos os usuários', async () => {
      // Arrange
      const mockUsers = userFixtures.validUsers;
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const users = await userService.getAllUsers();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
      expect(users).toEqual(mockUsers);
    });

    test('deve lançar erro quando repository falha', async () => {
      // Arrange
      mockUserRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.getAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário correto', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.valid;
      const mockUser = { id: userId, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const user = await userService.getUserById(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(user).toEqual(mockUser);
    });

    test('deve lançar erro para ID inválido', async () => {
      // Act & Assert
      await expect(userService.getUserById('invalid')).rejects.toThrow('ID inválido');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    test('deve retornar null para usuário não encontrado', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.nonExistent;
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const user = await userService.getUserById(userId);

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    test('deve criar um novo usuário', async () => {
      // Arrange
      const newUserData = userFixtures.newUser;
      const mockCreatedUser = { id: userFixtures.validUUIDs.valid, ...newUserData };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      // Act
      const createdUser = await userService.createUser(newUserData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUserData);
      expect(createdUser).toEqual(mockCreatedUser);
    });

    test('deve rejeitar usuário com email duplicado', async () => {
      // Arrange
      const existingUser = { id: userFixtures.validUUIDs.valid, name: 'Existing', email: 'john.doe@example.com' };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(userFixtures.duplicateEmail))
        .rejects.toThrow('Usuário com este email já existe');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('deve rejeitar dados inválidos', async () => {
      // Act & Assert
      await expect(userService.createUser(userFixtures.invalidUsers.invalidEmail))
        .rejects.toThrow('Erro de validação');
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    test('deve rejeitar dados faltando', async () => {
      // Act & Assert
      await expect(userService.createUser({}))
        .rejects.toThrow('Erro de validação');
    });
  });

  describe('updateUser', () => {
    test('deve atualizar um usuário', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.valid;
      const updateData = userFixtures.updatedUser;
      const existingUser = { id: userId, name: 'Old Name', email: 'old@example.com' };
      const mockUpdatedUser = { id: userId, ...updateData };
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const updatedUser = await userService.updateUser(userId, updateData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(updatedUser).toEqual(mockUpdatedUser);
    });

    test('deve rejeitar atualização com email duplicado', async () => {
      // Arrange
      const userId1 = userFixtures.validUUIDs.valid;
      const userId2 = userFixtures.validUUIDs.another;
      const existingUser = { id: userId2, name: 'Other User', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue({ id: userId1, name: 'User 1', email: 'user1@example.com' });
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.updateUser(userId1, { email: 'john.doe@example.com' }))
        .rejects.toThrow('Email já está em uso por outro usuário');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID inexistente', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.nonExistent;
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, { name: 'Test' }))
        .rejects.toThrow('Usuário não encontrado');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('deve permitir atualizar com o mesmo email do usuário', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.valid;
      const existingUser = { id: userId, name: 'User', email: 'user@example.com' };
      const mockUpdatedUser = { id: userId, name: 'Updated User', email: 'user@example.com' };
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const updatedUser = await userService.updateUser(userId, { name: 'Updated User' });

      // Assert
      expect(updatedUser).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    test('deve deletar um usuário', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.valid;
      const mockDeletedUser = { id: userId, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockDeletedUser);
      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const deletedUser = await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(deletedUser).toEqual(mockDeletedUser);
    });

    test('deve rejeitar ID inválido', async () => {
      // Act & Assert
      await expect(userService.deleteUser('invalid'))
        .rejects.toThrow('ID inválido');
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID inexistente', async () => {
      // Arrange
      const userId = userFixtures.validUUIDs.nonExistent;
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId))
        .rejects.toThrow('Usuário não encontrado');
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Constructor', () => {
    test('deve lançar erro quando userRepository não fornecido', () => {
      // Act & Assert
      expect(() => new UserService()).toThrow('UserRepository é obrigatório');
      expect(() => new UserService(null)).toThrow('UserRepository é obrigatório');
    });
  });

  describe('Error handling', () => {
    describe('getAllUsers error cases', () => {
      test('deve retornar array vazio quando users é null', async () => {
        // Arrange
        mockUserRepository.findAll.mockResolvedValue(null);

        // Act
        const users = await userService.getAllUsers();

        // Assert
        expect(users).toEqual([]);
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        mockUserRepository.findAll.mockRejectedValue(new Error('Erro de conexão com o banco'));

        // Act & Assert
        await expect(userService.getAllUsers()).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockUserRepository.findAll.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.getAllUsers()).rejects.toThrow('Erro no serviço ao obter usuários');
      });
    });

    describe('getUserById error cases', () => {
      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userService.getUserById()).rejects.toThrow('ID é obrigatório');
        await expect(userService.getUserById('')).rejects.toThrow('ID é obrigatório');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.getUserById(userId)).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.getUserById(userId)).rejects.toThrow('Erro no serviço ao obter usuário');
      });
    });

    describe('createUser error cases', () => {
      test('deve lançar erro quando userData não fornecido', async () => {
        // Act & Assert
        await expect(userService.createUser()).rejects.toThrow('Dados do usuário são obrigatórios');
        await expect(userService.createUser(null)).rejects.toThrow('Dados do usuário são obrigatórios');
        await expect(userService.createUser('string')).rejects.toThrow('Dados do usuário são obrigatórios');
      });

      test('deve tratar erro quando newUser é null', async () => {
        // Arrange
        const newUserData = userFixtures.newUser;
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.createUser(newUserData)).rejects.toThrow('Falha ao criar usuário');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const newUserData = userFixtures.newUser;
        mockUserRepository.findByEmail.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.createUser(newUserData)).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        const newUserData = userFixtures.newUser;
        mockUserRepository.findByEmail.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.createUser(newUserData)).rejects.toThrow('Erro no serviço ao criar usuário');
      });
    });

    describe('updateUser error cases', () => {
      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userService.updateUser()).rejects.toThrow('ID é obrigatório');
        await expect(userService.updateUser('')).rejects.toThrow('ID é obrigatório');
      });

      test('deve lançar erro quando userData inválido', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;

        // Act & Assert
        await expect(userService.updateUser(userId, null)).rejects.toThrow('Dados para atualização são obrigatórios');
        await expect(userService.updateUser(userId, 'string')).rejects.toThrow('Dados para atualização são obrigatórios');
        await expect(userService.updateUser(userId, {})).rejects.toThrow('Dados para atualização são obrigatórios');
      });

      test('deve tratar erro quando updatedUser é null', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        const existingUser = { id: userId, name: 'User', email: 'user@example.com' };
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.update.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.updateUser(userId, { name: 'Updated' })).rejects.toThrow('Falha ao atualizar usuário');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.updateUser(userId, { name: 'Test' })).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.updateUser(userId, { name: 'Test' })).rejects.toThrow('Erro no serviço ao atualizar usuário');
      });
    });

    describe('deleteUser error cases', () => {
      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userService.deleteUser()).rejects.toThrow('ID é obrigatório');
        await expect(userService.deleteUser('')).rejects.toThrow('ID é obrigatório');
      });

      test('deve tratar erro quando deletedUser é null', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        const existingUser = { id: userId, name: 'User', email: 'user@example.com' };
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.delete.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.deleteUser(userId)).rejects.toThrow('Falha ao deletar usuário');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.deleteUser(userId)).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        const userId = userFixtures.validUUIDs.valid;
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.deleteUser(userId)).rejects.toThrow('Erro no serviço ao deletar usuário');
      });
    });
  });
});