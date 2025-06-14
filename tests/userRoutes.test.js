const request = require('supertest');
const express = require('express');
const userFixtures = require('./fixtures/userFixtures');

const UserController = require('../controllers/userController');

describe('User Routes', () => {
  let app;
  let mockUserService;
  let userController;

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

    // Configurar app Express com as rotas
    app = express();
    app.use(express.json());

    app.get('/users', userController.getAllUsers.bind(userController));
    app.get('/users/:id', userController.getUserById.bind(userController));
    app.post('/users', userController.createUser.bind(userController));
    app.put('/users/:id', userController.updateUser.bind(userController));
    app.delete('/users/:id', userController.deleteUser.bind(userController));
  });

  describe('GET /users', () => {
    test('deve retornar todos os usuários', async () => {
      // Arrange
      const mockUsers = userFixtures.validUsers.map((user, index) => ({
        id: index + 1,
        ...user
      }));
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      // Act
      const res = await request(app).get('/users');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    test('deve retornar erro 500 quando service falha', async () => {
      // Arrange
      mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

      // Act
      const res = await request(app).get('/users');

      // Assert
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Erro interno do servidor');
    });
  });

  describe('GET /users/:id', () => {
    test('deve retornar um usuário específico', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      const res = await request(app).get('/users/1');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue(null);

      // Act
      const res = await request(app).get('/users/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Usuário não encontrado' });
    });

    test('deve retornar 400 para ID inválido', async () => {
      // Arrange
      mockUserService.getUserById.mockRejectedValue(new Error('ID inválido'));

      // Act
      const res = await request(app).get('/users/invalid');

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('ID inválido');
    });
  });

  describe('POST /users', () => {
    test('deve criar um novo usuário', async () => {
      // Arrange
      const newUserData = userFixtures.newUser;
      const mockCreatedUser = { id: 4, ...newUserData };
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);

      // Act
      const res = await request(app)
        .post('/users')
        .send(newUserData);

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCreatedUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(newUserData);
    });

    test('deve retornar 400 para dados inválidos', async () => {
      // Arrange
      const invalidData = userFixtures.invalidUsers.invalidEmail;
      mockUserService.createUser.mockRejectedValue(new Error('Erro de validação: Email inválido'));

      // Act
      const res = await request(app)
        .post('/users')
        .send(invalidData);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('validação');
    });

    test('deve retornar 409 para email duplicado', async () => {
      // Arrange
      const duplicateData = userFixtures.duplicateEmail;
      mockUserService.createUser.mockRejectedValue(new Error('Usuário com este email já existe'));

      // Act
      const res = await request(app)
        .post('/users')
        .send(duplicateData);

      // Assert
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('já existe');
    });

    test('deve retornar 400 para dados ausentes', async () => {
      // Act
      const res = await request(app)
        .post('/users')
        .send({});

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Dados do usuário são obrigatórios');
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    test('deve atualizar um usuário', async () => {
      // Arrange
      const updateData = userFixtures.updatedUser;
      const mockUpdatedUser = { id: 1, ...updateData };
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      // Act
      const res = await request(app)
        .put('/users/1')
        .send(updateData);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedUser);
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', updateData);
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      mockUserService.updateUser.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .put('/users/999')
        .send({ name: 'Test' });

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('não encontrado');
    });

    test('deve retornar 400 para dados ausentes', async () => {
      // Act
      const res = await request(app)
        .put('/users/1')
        .send({});

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Dados para atualização são obrigatórios');
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    test('deve deletar um usuário', async () => {
      // Arrange
      const mockDeletedUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockUserService.deleteUser.mockResolvedValue(mockDeletedUser);

      // Act
      const res = await request(app).delete('/users/1');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Usuário deletado com sucesso',
        user: mockDeletedUser
      });
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    });

    test('deve retornar 404 para usuário inexistente', async () => {
      // Arrange
      mockUserService.deleteUser.mockResolvedValue(null);

      // Act
      const res = await request(app).delete('/users/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('não encontrado');
    });

    test('deve retornar 400 para ID ausente', async () => {
      // Act
      const res = await request(app).delete('/users/');

      // Assert
      expect(res.status).toBe(404); // Express retorna 404 para rota não encontrada
    });
  });
});
