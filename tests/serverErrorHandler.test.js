const ServerErrorHandler = require('../helpers/serverErrorHandler');

// Mock do módulo de configuração do banco
jest.mock('../config/db', () => ({
  connect: jest.fn()
}));

describe('ServerErrorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    
    // Limpar mocks
    jest.clearAllMocks();
  });

  describe('notFoundHandler', () => {
    test('deve retornar 404 com informações da requisição', () => {
      // Act
      ServerErrorHandler.notFoundHandler(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Página não encontrada',
        path: '/test',
        method: 'GET'
      });
    });

    test('deve funcionar com diferentes métodos HTTP', () => {
      // Arrange
      req.method = 'POST';
      req.path = '/api/users';
      
      // Act
      ServerErrorHandler.notFoundHandler(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Página não encontrada',
        path: '/api/users',
        method: 'POST'
      });
    });
  });

  describe('globalErrorHandler', () => {
    beforeEach(() => {
      // Mock console.error para evitar logs durante os testes
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('deve tratar erro conhecido do sistema com status correto', () => {
      // Arrange
      const error = new Error('Erro de validação: campo inválido');
      error.stack = 'Error stack trace...';
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(console.error).toHaveBeenCalledWith('Server Error:', error.stack);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Erro de validação: campo inválido' 
      });
    });

    test('deve tratar erro de conflito corretamente', () => {
      // Arrange
      const error = new Error('Email já existe');
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Email já existe' 
      });
    });

    test('deve tratar erro de não encontrado', () => {
      // Arrange
      const error = new Error('Usuário não encontrado');
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Usuário não encontrado' 
      });
    });

    test('deve tratar erro de conexão com mensagem personalizada', () => {
      // Arrange
      const error = new Error('Erro de conexão com o banco');
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Serviço temporariamente indisponível' 
      });
    });

    test('deve tratar erro genérico quando não é conhecido', () => {
      // Arrange
      const error = new Error('Erro desconhecido do sistema');
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Erro desconhecido do sistema' 
      });
    });

    test('deve tratar erro sem mensagem', () => {
      // Arrange
      const error = {};
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Erro interno do servidor' 
      });
    });

    test('deve logar o stack trace do erro', () => {
      // Arrange
      const error = new Error('Teste erro');
      error.stack = 'Error: Teste erro\n    at test.js:1:1';
      
      // Act
      ServerErrorHandler.globalErrorHandler(error, req, res, next);
      
      // Assert
      expect(console.error).toHaveBeenCalledWith('Server Error:', error.stack);
    });
  });

  describe('databaseConnectionHandler', () => {
    let mockDb;

    beforeEach(() => {
      mockDb = require('../config/db');
      // Mock console.log e console.error
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.log.mockRestore();
      console.error.mockRestore();
    });

    test('deve retornar true quando conexão é bem-sucedida', async () => {
      // Arrange
      mockDb.connect.mockResolvedValue();
      
      // Act
      const result = await ServerErrorHandler.databaseConnectionHandler();
      
      // Assert
      expect(result).toBe(true);
      expect(mockDb.connect).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('✅ Conectado ao banco de dados PostgreSQL');
    });

    test('deve retornar false quando conexão falha', async () => {
      // Arrange
      const dbError = new Error('Connection failed');
      mockDb.connect.mockRejectedValue(dbError);
      
      // Act
      const result = await ServerErrorHandler.databaseConnectionHandler();
      
      // Assert
      expect(result).toBe(false);
      expect(mockDb.connect).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('❌ Erro ao conectar ao banco de dados:', 'Connection failed');
    });

    test('deve tratar erro sem mensagem na conexão', async () => {
      // Arrange
      const dbError = new Error();
      mockDb.connect.mockRejectedValue(dbError);
      
      // Act
      const result = await ServerErrorHandler.databaseConnectionHandler();
      
      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('❌ Erro ao conectar ao banco de dados:', '');
    });

    test('deve tratar erro de timeout na conexão', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      mockDb.connect.mockRejectedValue(timeoutError);
      
      // Act
      const result = await ServerErrorHandler.databaseConnectionHandler();
      
      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('❌ Erro ao conectar ao banco de dados:', 'Connection timeout');
    });

    test('deve tratar erro de credenciais inválidas', async () => {
      // Arrange
      const authError = new Error('Invalid credentials');
      mockDb.connect.mockRejectedValue(authError);
      
      // Act
      const result = await ServerErrorHandler.databaseConnectionHandler();
      
      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('❌ Erro ao conectar ao banco de dados:', 'Invalid credentials');
    });
  });
});