const ErrorHandler = require('./errorHandler');

class ServerErrorHandler {
  static notFoundHandler(req, res, next) {
    res.status(404).json({ 
      error: 'Página não encontrada',
      path: req.path,
      method: req.method 
    });
  }

  static globalErrorHandler(err, req, res, next) {
    console.error('Server Error:', err.stack);
    
    // Se é um erro conhecido do nosso sistema
    if (err.message) {
      const status = ErrorHandler.getHttpStatusFromError(err);
      const message = ErrorHandler.getErrorMessage(err);
      return res.status(status).json({ error: message });
    }
    
    // Erro genérico do servidor
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }

  static async databaseConnectionHandler() {
    try {
      const db = require('../config/db');
      await db.connect();
      console.log('✅ Conectado ao banco de dados PostgreSQL');
      return true;
    } catch (err) {
      console.error('❌ Erro ao conectar ao banco de dados:', err.message);
      return false;
    }
  }
}

module.exports = ServerErrorHandler;