const UserRepository = require('../repositories/userRepository');
const userFixtures = require('./fixtures/userFixtures');

describe('UserRepository', () => {
  let userRepository;
  let mockDb;

  beforeEach(() => {
    // Mock do pool de conexão do banco
    mockDb = {
      query: jest.fn()
    };
    
    userRepository = new UserRepository();
    userRepository.db = mockDb;
  });

  describe('findAll', () => {
    test('deve retornar todos os usuários', async () => {
      // Arrange
      const mockUsers = userFixtures.validUsers.map((user, index) => ({
        id: index + 1,
        ...user
      }));
      mockDb.query.mockResolvedValue({ rows: mockUsers });

      // Act
      const users = await userRepository.findAll();

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY id');
      expect(users).toEqual(mockUsers);
    });
  });

  describe('findById', () => {
    test('deve retornar usuário por ID', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockDb.query.mockResolvedValue({ rows: [mockUser] });

      // Act
      const user = await userRepository.findById(1);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(user).toEqual(mockUser);
    });

    test('deve retornar null para ID inexistente', async () => {
      // Arrange
      mockDb.query.mockResolvedValue({ rows: [] });

      // Act
      const user = await userRepository.findById(999);

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    test('deve criar um novo usuário', async () => {
      // Arrange
      const newUserData = userFixtures.newUser;
      const mockCreatedUser = { id: 4, ...newUserData };
      mockDb.query.mockResolvedValue({ rows: [mockCreatedUser] });

      // Act
      const newUser = await userRepository.create(newUserData);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [newUserData.name, newUserData.email]
      );
      expect(newUser).toEqual(mockCreatedUser);
    });
  });

  describe('update', () => {
    test('deve atualizar um usuário existente', async () => {
      // Arrange
      const updateData = userFixtures.updatedUser;
      const mockUpdatedUser = { id: 1, ...updateData };
      mockDb.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      // Act
      const updatedUser = await userRepository.update(1, updateData);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [updateData.name, updateData.email, 1]
      );
      expect(updatedUser).toEqual(mockUpdatedUser);
    });

    test('deve retornar null se usuário não existir', async () => {
      // Arrange
      mockDb.query.mockResolvedValue({ rows: [] });

      // Act
      const result = await userRepository.update(999, { name: 'Test' });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    test('deve deletar um usuário existente', async () => {
      // Arrange
      const mockDeletedUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockDb.query.mockResolvedValue({ rows: [mockDeletedUser] });

      // Act
      const deletedUser = await userRepository.delete(1);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1 RETURNING *', [1]);
      expect(deletedUser).toEqual(mockDeletedUser);
    });

    test('deve retornar null para ID inexistente', async () => {
      // Arrange
      mockDb.query.mockResolvedValue({ rows: [] });

      // Act
      const result = await userRepository.delete(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    test('deve encontrar usuário por email', async () => {
      // Arrange
      const mockUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
      mockDb.query.mockResolvedValue({ rows: [mockUser] });

      // Act
      const user = await userRepository.findByEmail('john.doe@example.com');

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['john.doe@example.com']);
      expect(user).toEqual(mockUser);
    });

    test('deve retornar null para email inexistente', async () => {
      // Arrange
      mockDb.query.mockResolvedValue({ rows: [] });

      // Act
      const user = await userRepository.findByEmail('nonexistent@example.com');

      // Assert
      expect(user).toBeNull();
    });
  });
});