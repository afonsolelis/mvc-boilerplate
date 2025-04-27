const express = require('express');
const app = express();
const path = require('path');
const routes = require('./routes');

// Configura o mecanismo de views para EJS
app.set('view engine', 'ejs');

// Define onde ficam as views
app.set('views', path.join(__dirname, 'views'));

// Define a pasta pública com CSS e outros arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usa o arquivo de rotas
app.use('/', routes);

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});