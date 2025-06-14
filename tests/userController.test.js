const UserController = require('../controllers/userController');
const userFixtures = require('./fixtures/userFixtures');

describe('UserController', () => {
  let userController;
  let mockUserService;
  let req, res;

  beforeEach(() => {
    // Mock do UserService
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    };

    userController = new UserController(mockUserService);

    // Mock do request e response
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllUsers', () => {
    test('deve retornar todos os usuários com status 200', async () => {
      // Arrange
      const mockUsers = userFixtures.validUsers.map((user, index) => ({
        id: index + 1,
        ...user
      }));
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('deve retornar erro 500 quando service falha', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário correto', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      req.params = { id: '999' };
      mockUserService.getUserById.mockResolvedValue(null);

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve retornar 400 para ID ausente', async () => {
      // Arrange
      req.params = {};

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID é obrigatório' });
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
    });

    test('deve retornar 400 para ID inválido', async () => {
      // Arrange
      req.params = { id: 'invalid' };
      mockUserService.getUserById.mockRejectedValue(new Error('ID inválido'));

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID inválido' });
    });
  });

  describe('createUser', () => {
    test('deve criar um novo usuário', async () => {
      // Arrange
      req.body = userFixtures.newUser;
      const mockCreatedUser = { id: 4, ...userFixtures.newUser };
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(userFixtures.newUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedUser);
    });

    test('deve retornar 400 para dados ausentes', async () => {
      // Arrange
      req.body = {};

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Dados do usuário são obrigatórios' });
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    test('deve retornar 400 para dados inválidos', async () => {
      // Arrange
      req.body = userFixtures.invalidUsers.invalidEmail;
      mockUserService.createUser.mockRejectedValue(new Error('Erro de validação: Email inválido'));

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro de validação: Email inválido' });
    });

    test('deve retornar 409 para email duplicado', async () => {
      // Arrange
      req.body = userFixtures.duplicateEmail;
      mockUserService.createUser.mockRejectedValue(new Error('Usuário com este email já existe'));

      // Act
      await userController.createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário com este email já existe' });
    });
  });

  describe('updateUser', () => {
    test('deve atualizar um usuário', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = userFixtures.updatedUser;
      const mockUpdatedUser = { id: 1, ...userFixtures.updatedUser };
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', userFixtures.updatedUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test('deve retornar 400 para ID ausente', async () => {
      // Arrange
      req.params = {};
      req.body = { name: 'Test' };

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID é obrigatório' });
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    test('deve retornar 400 para dados ausentes', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {};

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Dados para atualização são obrigatórios' });
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      req.params = { id: '999' };
      req.body = { name: 'Test' };
      mockUserService.updateUser.mockResolvedValue(null);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });

  describe('deleteUser', () => {
    test('deve deletar um usuário', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockDeletedUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserService.deleteUser.mockResolvedValue(mockDeletedUser);

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário deletado com sucesso',
        user: mockDeletedUser
      });
    });

    test('deve retornar 400 para ID ausente', async () => {
      // Arrange
      req.params = {};

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID é obrigatório' });
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      req.params = { id: '999' };
      mockUserService.deleteUser.mockResolvedValue(null);

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });
  });

  // Testes para casos de erro não cobertos
  describe('Error handling', () => {
    test('deve tratar erro de updateUser quando retorna null', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = { name: 'Updated User' };
      mockUserService.updateUser.mockResolvedValue(null);

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve tratar erro de deleteUser quando retorna null', async () => {
      // Arrange
      req.params = { id: '1' };
      mockUserService.deleteUser.mockResolvedValue(null);

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve tratar erro de validação na _handleError', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Erro de validação'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro de validação' });
    });

    test('deve tratar erro de não encontrado na _handleError', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Usuário não encontrado'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve tratar erro de conexão na _handleError', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Erro de conexão'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ error: 'Serviço temporariamente indisponível' });
    });

    test('deve tratar erro de timeout na _handleError', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Connection timeout'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ error: 'Serviço temporariamente indisponível' });
    });

    test('deve tratar erro de banco na _handleError', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Erro do banco de dados'));

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ error: 'Serviço temporariamente indisponível' });
    });

    test('deve tratar exceção no updateUser', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = { name: 'Updated User' };
      mockUserService.updateUser.mockRejectedValue(new Error('Database error'));

      // Act
      await userController.updateUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
    });

    test('deve tratar exceção no deleteUser', async () => {
      // Arrange
      req.params = { id: '1' };
      mockUserService.deleteUser.mockRejectedValue(new Error('Database error'));

      // Act
      await userController.deleteUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
    });
  });
});
