require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const ServerErrorHandler = require('./helpers/serverErrorHandler');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  const dbConnected = await ServerErrorHandler.databaseConnectionHandler();
  
  if (!dbConnected) {
    process.exit(1);
  }

  app.use(express.json());

  const userRoutes = require('./routes/userRoutes');
  app.use('/users', userRoutes);

  const frontendRoutes = require('./routes/frontRoutes');
  app.use('/', frontendRoutes);

  // Middleware para lidar com erros de rota não encontrada
  app.use(ServerErrorHandler.notFoundHandler);

  // Middleware para lidar com erros internos do servidor
  app.use(ServerErrorHandler.globalErrorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

startServer();
