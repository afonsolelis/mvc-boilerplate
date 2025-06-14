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
});
