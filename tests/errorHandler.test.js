const ErrorHandler = require('../helpers/errorHandler');

describe('ErrorHandler', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('handleControllerError', () => {
    test('deve retornar status 400 para erro de validação', () => {
      const error = new Error('Erro de validação: Email inválido');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro de validação: Email inválido' });
    });

    test('deve retornar status 400 para ID inválido', () => {
      const error = new Error('ID inválido');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID inválido' });
    });

    test('deve retornar status 409 para erro de conflito', () => {
      const error = new Error('Email já existe');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email já existe' });
    });

    test('deve retornar status 404 para não encontrado', () => {
      const error = new Error('Usuário não encontrado');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    test('deve retornar status 503 para erro de conexão', () => {
      const error = new Error('Erro de conexão');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ error: 'Serviço temporariamente indisponível' });
    });

    test('deve retornar status 500 para erro genérico', () => {
      const error = new Error('Erro desconhecido');
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
    });

    test('deve retornar status 500 para erro sem mensagem', () => {
      const error = new Error();
      
      ErrorHandler.handleControllerError(error, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno do servidor' });
    });
  });

  describe('getHttpStatusFromError', () => {
    test('deve retornar 400 para erro de validação', () => {
      const error = new Error('Erro de validação');
      expect(ErrorHandler.getHttpStatusFromError(error)).toBe(400);
    });

    test('deve retornar 409 para erro de conflito', () => {
      const error = new Error('já existe');
      expect(ErrorHandler.getHttpStatusFromError(error)).toBe(409);
    });

    test('deve retornar 404 para não encontrado', () => {
      const error = new Error('não encontrado');
      expect(ErrorHandler.getHttpStatusFromError(error)).toBe(404);
    });

    test('deve retornar 503 para erro de conexão', () => {
      const error = new Error('timeout');
      expect(ErrorHandler.getHttpStatusFromError(error)).toBe(503);
    });

    test('deve retornar 500 para erro genérico', () => {
      const error = new Error('algo deu errado');
      expect(ErrorHandler.getHttpStatusFromError(error)).toBe(500);
    });
  });

  describe('getErrorMessage', () => {
    test('deve retornar mensagem personalizada para erro de conexão', () => {
      const error = new Error('Erro de conexão');
      expect(ErrorHandler.getErrorMessage(error)).toBe('Serviço temporariamente indisponível');
    });

    test('deve retornar mensagem original para outros erros', () => {
      const error = new Error('Erro de validação');
      expect(ErrorHandler.getErrorMessage(error)).toBe('Erro de validação');
    });

    test('deve retornar mensagem padrão para erro sem mensagem', () => {
      const error = new Error();
      expect(ErrorHandler.getErrorMessage(error)).toBe('Erro interno do servidor');
    });
  });

  describe('métodos de verificação de tipo de erro', () => {
    test('isValidationError deve identificar erros de validação', () => {
      expect(ErrorHandler.isValidationError(new Error('Erro de validação'))).toBe(true);
      expect(ErrorHandler.isValidationError(new Error('ID inválido'))).toBe(true);
      expect(ErrorHandler.isValidationError(new Error('Email inválido'))).toBe(true);
      expect(ErrorHandler.isValidationError(new Error('outro erro'))).toBe(false);
    });

    test('isConflictError deve identificar erros de conflito', () => {
      expect(ErrorHandler.isConflictError(new Error('já existe'))).toBe(true);
      expect(ErrorHandler.isConflictError(new Error('já está em uso'))).toBe(true);
      expect(ErrorHandler.isConflictError(new Error('outro erro'))).toBe(false);
    });

    test('isNotFoundError deve identificar erros de não encontrado', () => {
      expect(ErrorHandler.isNotFoundError(new Error('não encontrado'))).toBe(true);
      expect(ErrorHandler.isNotFoundError(new Error('outro erro'))).toBe(false);
    });

    test('isServiceUnavailableError deve identificar erros de serviço indisponível', () => {
      expect(ErrorHandler.isServiceUnavailableError(new Error('conexão'))).toBe(true);
      expect(ErrorHandler.isServiceUnavailableError(new Error('timeout'))).toBe(true);
      expect(ErrorHandler.isServiceUnavailableError(new Error('banco'))).toBe(true);
      expect(ErrorHandler.isServiceUnavailableError(new Error('outro erro'))).toBe(false);
    });
  });
});