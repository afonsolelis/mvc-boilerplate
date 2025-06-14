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

    test('deve lançar erro quando email não fornecido', async () => {
      // Act & Assert
      await expect(userRepository.findByEmail()).rejects.toThrow('Email é obrigatório para busca');
      await expect(userRepository.findByEmail('')).rejects.toThrow('Email é obrigatório para busca');
    });

    test('deve lançar erro quando db não disponível', async () => {
      // Arrange
      userRepository.db = null;

      // Act & Assert
      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Conexão com banco de dados não disponível');
    });

    test('deve tratar erro de conexão', async () => {
      // Arrange
      const connectionError = new Error('Connection failed');
      connectionError.code = 'ECONNREFUSED';
      mockDb.query.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Erro de conexão com o banco de dados');
    });

    test('deve tratar erro genérico', async () => {
      // Arrange
      mockDb.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Erro ao buscar usuário por email');
    });
  });

  // Testes para casos de erro não cobertos
  describe('Error handling', () => {
    describe('findAll error cases', () => {
      test('deve lançar erro quando db não disponível', async () => {
        // Arrange
        userRepository.db = null;

        // Act & Assert
        await expect(userRepository.findAll()).rejects.toThrow('Conexão com banco de dados não disponível');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const connectionError = new Error('Connection failed');
        connectionError.code = 'ECONNREFUSED';
        mockDb.query.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(userRepository.findAll()).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro de tabela não encontrada', async () => {
        // Arrange
        const tableError = new Error('Table not found');
        tableError.code = '42P01';
        mockDb.query.mockRejectedValue(tableError);

        // Act & Assert
        await expect(userRepository.findAll()).rejects.toThrow('Tabela de usuários não encontrada');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockDb.query.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(userRepository.findAll()).rejects.toThrow('Erro ao buscar usuários');
      });

      test('deve retornar array vazio quando result.rows é undefined', async () => {
        // Arrange
        mockDb.query.mockResolvedValue({});

        // Act
        const users = await userRepository.findAll();

        // Assert
        expect(users).toEqual([]);
      });
    });

    describe('findById error cases', () => {
      test('deve lançar erro quando db não disponível', async () => {
        // Arrange
        userRepository.db = null;

        // Act & Assert
        await expect(userRepository.findById(1)).rejects.toThrow('Conexão com banco de dados não disponível');
      });

      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userRepository.findById()).rejects.toThrow('ID é obrigatório para busca');
        await expect(userRepository.findById('')).rejects.toThrow('ID é obrigatório para busca');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const connectionError = new Error('Connection failed');
        connectionError.code = 'ECONNREFUSED';
        mockDb.query.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(userRepository.findById(1)).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro de ID inválido', async () => {
        // Arrange
        const typeError = new Error('Invalid type');
        typeError.code = '22P02';
        mockDb.query.mockRejectedValue(typeError);

        // Act & Assert
        await expect(userRepository.findById('invalid')).rejects.toThrow('ID deve ser um número válido');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockDb.query.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(userRepository.findById(1)).rejects.toThrow('Erro ao buscar usuário');
      });
    });

    describe('create error cases', () => {
      test('deve lançar erro quando db não disponível', async () => {
        // Arrange
        userRepository.db = null;

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Conexão com banco de dados não disponível');
      });

      test('deve lançar erro quando userData não fornecido', async () => {
        // Act & Assert
        await expect(userRepository.create()).rejects.toThrow('Nome e email são obrigatórios');
        await expect(userRepository.create({})).rejects.toThrow('Nome e email são obrigatórios');
        await expect(userRepository.create({ name: 'Test' })).rejects.toThrow('Nome e email são obrigatórios');
        await expect(userRepository.create({ email: 'test@example.com' })).rejects.toThrow('Nome e email são obrigatórios');
      });

      test('deve tratar erro quando result não tem rows', async () => {
        // Arrange
        mockDb.query.mockResolvedValue({ rows: [] });

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Falha ao criar usuário no banco de dados');
      });

      test('deve tratar erro quando result.rows é undefined', async () => {
        // Arrange
        mockDb.query.mockResolvedValue({});

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Falha ao criar usuário no banco de dados');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const connectionError = new Error('Connection failed');
        connectionError.code = 'ECONNREFUSED';
        mockDb.query.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro de email duplicado', async () => {
        // Arrange
        const duplicateError = new Error('Duplicate key');
        duplicateError.code = '23505';
        mockDb.query.mockRejectedValue(duplicateError);

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Email já está em uso');
      });

      test('deve tratar erro de dados obrigatórios', async () => {
        // Arrange
        const notNullError = new Error('Not null violation');
        notNullError.code = '23502';
        mockDb.query.mockRejectedValue(notNullError);

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Dados obrigatórios não fornecidos');
      });

      test('deve propagar erro de validação', async () => {
        // Arrange
        const validationError = new Error('Campo obrigatório não fornecido');
        mockDb.query.mockRejectedValue(validationError);

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Campo obrigatório não fornecido');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockDb.query.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(userRepository.create({ name: 'Test', email: 'test@example.com' })).rejects.toThrow('Erro ao criar usuário');
      });
    });

    describe('update error cases', () => {
      test('deve lançar erro quando db não disponível', async () => {
        // Arrange
        userRepository.db = null;

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Conexão com banco de dados não disponível');
      });

      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userRepository.update(null, { name: 'Test' })).rejects.toThrow('ID é obrigatório para atualização');
        await expect(userRepository.update('', { name: 'Test' })).rejects.toThrow('ID é obrigatório para atualização');
      });

      test('deve lançar erro quando userData inválido', async () => {
        // Act & Assert
        await expect(userRepository.update(1, null)).rejects.toThrow('Dados para atualização são obrigatórios');
        await expect(userRepository.update(1, 'string')).rejects.toThrow('Dados para atualização são obrigatórios');
      });

      test('deve lançar erro quando nenhum campo para atualizar', async () => {
        // Act & Assert
        await expect(userRepository.update(1, {})).rejects.toThrow('Nenhum campo para atualizar');
        await expect(userRepository.update(1, { other: 'field' })).rejects.toThrow('Nenhum campo para atualizar');
      });

      test('deve atualizar apenas nome', async () => {
        // Arrange
        const mockUpdatedUser = { id: 1, name: 'Updated Name', email: 'old@example.com' };
        mockDb.query.mockResolvedValue({ rows: [mockUpdatedUser] });

        // Act
        const result = await userRepository.update(1, { name: 'Updated Name' });

        // Assert
        expect(mockDb.query).toHaveBeenCalledWith('UPDATE users SET name = $1 WHERE id = $2 RETURNING *', ['Updated Name', 1]);
        expect(result).toEqual(mockUpdatedUser);
      });

      test('deve atualizar apenas email', async () => {
        // Arrange
        const mockUpdatedUser = { id: 1, name: 'Old Name', email: 'new@example.com' };
        mockDb.query.mockResolvedValue({ rows: [mockUpdatedUser] });

        // Act
        const result = await userRepository.update(1, { email: 'new@example.com' });

        // Assert
        expect(mockDb.query).toHaveBeenCalledWith('UPDATE users SET email = $1 WHERE id = $2 RETURNING *', ['new@example.com', 1]);
        expect(result).toEqual(mockUpdatedUser);
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const connectionError = new Error('Connection failed');
        connectionError.code = 'ECONNREFUSED';
        mockDb.query.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro de email duplicado', async () => {
        // Arrange
        const duplicateError = new Error('Duplicate key');
        duplicateError.code = '23505';
        mockDb.query.mockRejectedValue(duplicateError);

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Email já está em uso');
      });

      test('deve tratar erro de ID inválido', async () => {
        // Arrange
        const typeError = new Error('Invalid type');
        typeError.code = '22P02';
        mockDb.query.mockRejectedValue(typeError);

        // Act & Assert
        await expect(userRepository.update('invalid', { name: 'Test' })).rejects.toThrow('ID deve ser um número válido');
      });

      test('deve propagar erro de validação', async () => {
        // Arrange
        const validationError = new Error('Campo obrigatório não fornecido');
        mockDb.query.mockRejectedValue(validationError);

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Campo obrigatório não fornecido');
      });

      test('deve propagar erro de campo vazio', async () => {
        // Arrange
        const fieldError = new Error('Nenhum campo válido');
        mockDb.query.mockRejectedValue(fieldError);

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Nenhum campo válido');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockDb.query.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(userRepository.update(1, { name: 'Test' })).rejects.toThrow('Erro ao atualizar usuário');
      });
    });

    describe('delete error cases', () => {
      test('deve lançar erro quando db não disponível', async () => {
        // Arrange
        userRepository.db = null;

        // Act & Assert
        await expect(userRepository.delete(1)).rejects.toThrow('Conexão com banco de dados não disponível');
      });

      test('deve lançar erro quando ID não fornecido', async () => {
        // Act & Assert
        await expect(userRepository.delete()).rejects.toThrow('ID é obrigatório para exclusão');
        await expect(userRepository.delete('')).rejects.toThrow('ID é obrigatório para exclusão');
      });

      test('deve tratar erro de conexão', async () => {
        // Arrange
        const connectionError = new Error('Connection failed');
        connectionError.code = 'ECONNREFUSED';
        mockDb.query.mockRejectedValue(connectionError);

        // Act & Assert
        await expect(userRepository.delete(1)).rejects.toThrow('Erro de conexão com o banco de dados');
      });

      test('deve tratar erro de ID inválido', async () => {
        // Arrange
        const typeError = new Error('Invalid type');
        typeError.code = '22P02';
        mockDb.query.mockRejectedValue(typeError);

        // Act & Assert
        await expect(userRepository.delete('invalid')).rejects.toThrow('ID deve ser um número válido');
      });

      test('deve propagar erro de validação', async () => {
        // Arrange
        const validationError = new Error('Campo obrigatório não fornecido');
        mockDb.query.mockRejectedValue(validationError);

        // Act & Assert
        await expect(userRepository.delete(1)).rejects.toThrow('Campo obrigatório não fornecido');
      });

      test('deve tratar erro genérico', async () => {
        // Arrange
        mockDb.query.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(userRepository.delete(1)).rejects.toThrow('Erro ao deletar usuário');
      });
    });
  });
});