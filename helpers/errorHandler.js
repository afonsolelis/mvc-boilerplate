class ErrorHandler {
  static handleControllerError(error, res) {
    const errorMessage = error.message || 'Erro interno do servidor';
    
    if (errorMessage.includes('validação') || 
        errorMessage.includes('ID inválido') ||
        errorMessage.includes('Email inválido')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    if (errorMessage.includes('já existe') || 
        errorMessage.includes('já está em uso')) {
      return res.status(409).json({ error: errorMessage });
    }
    
    if (errorMessage.includes('não encontrado')) {
      return res.status(404).json({ error: errorMessage });
    }

    if (errorMessage.includes('conexão') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('banco')) {
      return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    }
    
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }

  static getHttpStatusFromError(error) {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('validação') || 
        errorMessage.includes('ID inválido') ||
        errorMessage.includes('Email inválido')) {
      return 400;
    }
    
    if (errorMessage.includes('já existe') || 
        errorMessage.includes('já está em uso')) {
      return 409;
    }
    
    if (errorMessage.includes('não encontrado')) {
      return 404;
    }

    if (errorMessage.includes('conexão') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('banco')) {
      return 503;
    }
    
    return 500;
  }

  static getErrorMessage(error) {
    const errorMessage = error.message || 'Erro interno do servidor';
    
    if (errorMessage.includes('conexão') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('banco')) {
      return 'Serviço temporariamente indisponível';
    }
    
    return errorMessage;
  }

  static isValidationError(error) {
    const errorMessage = error.message || '';
    return errorMessage.includes('validação') || 
           errorMessage.includes('ID inválido') ||
           errorMessage.includes('Email inválido');
  }

  static isConflictError(error) {
    const errorMessage = error.message || '';
    return errorMessage.includes('já existe') || 
           errorMessage.includes('já está em uso');
  }

  static isNotFoundError(error) {
    const errorMessage = error.message || '';
    return errorMessage.includes('não encontrado');
  }

  static isServiceUnavailableError(error) {
    const errorMessage = error.message || '';
    return errorMessage.includes('conexão') || 
           errorMessage.includes('timeout') ||
           errorMessage.includes('banco');
  }
}

module.exports = ErrorHandler;