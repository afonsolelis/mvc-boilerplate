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
      const mockUsers = userFixtures.validUsers.map((user, index) => ({
        id: index + 1,
        ...user
      }));
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
      const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const user = await userService.getUserById('1');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(user).toEqual(mockUser);
    });

    test('deve lançar erro para ID inválido', async () => {
      // Act & Assert
      await expect(userService.getUserById('invalid')).rejects.toThrow('ID inválido');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    test('deve retornar null para usuário não encontrado', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const user = await userService.getUserById('999');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    test('deve criar um novo usuário', async () => {
      // Arrange
      const newUserData = userFixtures.newUser;
      const mockCreatedUser = { id: 4, ...newUserData };
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
      const existingUser = { id: 1, name: 'Existing', email: 'john.doe@example.com' };
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
      const updateData = userFixtures.updatedUser;
      const existingUser = { id: 1, name: 'Old Name', email: 'old@example.com' };
      const mockUpdatedUser = { id: 1, ...updateData };
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const updatedUser = await userService.updateUser('1', updateData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(updatedUser).toEqual(mockUpdatedUser);
    });

    test('deve rejeitar atualização com email duplicado', async () => {
      // Arrange
      const existingUser = { id: 2, name: 'Other User', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue({ id: 1, name: 'User 1', email: 'user1@example.com' });
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.updateUser('1', { email: 'john.doe@example.com' }))
        .rejects.toThrow('Email já está em uso por outro usuário');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('deve rejeitar ID inexistente', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser('999', { name: 'Test' }))
        .rejects.toThrow('Usuário não encontrado');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test('deve permitir atualizar com o mesmo email do usuário', async () => {
      // Arrange
      const existingUser = { id: 1, name: 'User', email: 'user@example.com' };
      const mockUpdatedUser = { id: 1, name: 'Updated User', email: 'user@example.com' };
      
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const updatedUser = await userService.updateUser('1', { name: 'Updated User' });

      // Assert
      expect(updatedUser).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    test('deve deletar um usuário', async () => {
      // Arrange
      const mockDeletedUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockDeletedUser); // Mock para verificar se usuário existe
      mockUserRepository.delete.mockResolvedValue(mockDeletedUser);

      // Act
      const deletedUser = await userService.deleteUser('1');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
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
      mockUserRepository.findById.mockResolvedValue(null); // Usuário não existe

      // Act & Assert
      await expect(userService.deleteUser('999'))
        .rejects.toThrow('Usuário não encontrado');
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  // Testes para casos de erro não cobertos
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
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.getUserById('1')).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.getUserById('1')).rejects.toThrow('Erro no serviço ao obter usuário');
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
        // Act & Assert
        await expect(userService.updateUser('1', null)).rejects.toThrow('Dados para atualização são obrigatórios');
        await expect(userService.updateUser('1', 'string')).rejects.toThrow('Dados para atualização são obrigatórios');
        await expect(userService.updateUser('1', {})).rejects.toThrow('Dados para atualização são obrigatórios');
      });

      test('deve tratar erro quando updatedUser é null', async () => {
        // Arrange
        const existingUser = { id: 1, name: 'User', email: 'user@example.com' };
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.update.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.updateUser('1', { name: 'Updated' })).rejects.toThrow('Falha ao atualizar usuário');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.updateUser('1', { name: 'Test' })).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.updateUser('1', { name: 'Test' })).rejects.toThrow('Erro no serviço ao atualizar usuário');
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
        const existingUser = { id: 1, name: 'User', email: 'user@example.com' };
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.delete.mockResolvedValue(null);

        // Act & Assert
        await expect(userService.deleteUser('1')).rejects.toThrow('Falha ao deletar usuário');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        mockUserRepository.findById.mockRejectedValue(new Error('Erro de conexão com banco'));

        // Act & Assert
        await expect(userService.deleteUser('1')).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockUserRepository.findById.mockRejectedValue(new Error('Erro genérico'));

        // Act & Assert
        await expect(userService.deleteUser('1')).rejects.toThrow('Erro no serviço ao deletar usuário');
      });
    });
  });
});
