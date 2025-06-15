# MVC Boilerplate - Node.js com PostgreSQL e Autenticação Supabase

Uma aplicação completa seguindo o padrão MVC (Model-View-Controller) com Node.js, Express, PostgreSQL, autenticação via Supabase e interface web com EJS.

## 🚀 Funcionalidades

- **Autenticação Completa**: Sistema de login/registro usando Supabase Auth
- **Isolamento de Dados**: Cada usuário vê apenas seus próprios dados
- **CRUD Protegido**: API REST para gerenciamento de usuários com autenticação
- **Interface Web Moderna**: Frontend responsivo com EJS e CSS moderno
- **Padrão MVC**: Arquitetura bem estruturada e organizada
- **Validação de Dados**: Validação usando Joi
- **Testes Automatizados**: Cobertura completa com Jest
- **PostgreSQL**: Banco de dados robusto com UUID como chave primária
- **Repository Pattern**: Separação clara entre camadas de dados

## 📋 Requisitos

- Node.js (versão 14 ou superior)
- Docker e Docker Compose (recomendado)
- **OU** PostgreSQL (versão 12 ou superior) instalado localmente
- Conta no Supabase (gratuita)

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/mvc-boilerplate.git
cd mvc-boilerplate
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

O arquivo `.env` deve conter:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=mvc_boilerplate
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false

# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://szdwjfsvagomhwjxqsqr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZHdqZnN2YWdvbWh3anhxc3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMTIwNTYsImV4cCI6MjA1Njc4ODA1Nn0.W0l_r1v95z4frdfq-XxL014UUmEJ9mFzTsdK8Wa_Wew

# Site Configuration
SITE_URL=http://localhost:3000

# Session Secret (altere para produção)
SESSION_SECRET=your-super-secret-key-change-this-in-production
```

4. **Configure o banco de dados:**
```bash
# Sobe PostgreSQL com Docker
npm run docker:up

# Executa a migração base
npm run migrate:dev

# Adiciona a coluna owner_id para isolamento de dados
psql -h localhost -U postgres -d mvc_boilerplate -f scripts/add-owner-column.sql
```

## 🎯 Como Usar

### Iniciar o servidor
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

### Executar testes
```bash
# Todos os testes
npm test

# Com cobertura de código
npm run test:coverage
```

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Registro**: Usuários se registram via `/register`
2. **Login**: Autenticação via `/login` com Supabase
3. **Proteção**: Todas as rotas são protegidas por middleware
4. **Isolamento**: Cada usuário vê apenas seus próprios dados
5. **Logout**: Limpeza de sessão e redirecionamento

### Páginas Disponíveis
- `GET /` - Página inicial
- `GET /login` - Página de login
- `GET /register` - Página de registro
- `GET /dashboard` - Dashboard do usuário (protegido)

## 🌐 Endpoints da API

### Usuários
- `GET /users` - Lista todos os usuários
- `GET /users/:id` - Busca usuário por ID
- `POST /users` - Cria novo usuário
- `PUT /users/:id` - Atualiza usuário
- `DELETE /users/:id` - Remove usuário

### Interface Web
- `GET /` - Página inicial com lista de usuários
- `GET /about` - Página sobre

### Adminer (Interface do Banco)
- `http://localhost:8080` - Interface web para gerenciar PostgreSQL
  - **Sistema**: PostgreSQL
  - **Servidor**: postgres
  - **Usuário**: mvc_user
  - **Senha**: mvc_password
  - **Base de dados**: mvc_database

## 📁 Estrutura do Projeto

```
mvc-boilerplate/
├── config/
│   └── db.js                 # Configurações do banco de dados
├── controllers/
│   └── userController.js     # Controlador de usuários
├── models/
│   └── userModel.js         # Modelo de dados do usuário
├── repositories/
│   └── userRepository.js    # Camada de acesso aos dados
├── routes/
│   ├── userRoutes.js        # Rotas da API
│   └── frontRoutes.js       # Rotas do frontend
├── services/
│   └── userService.js       # Lógica de negócio
├── views/
│   ├── components/
│   │   └── header.ejs       # Componente de cabeçalho
│   ├── css/
│   │   └── style.css        # Estilos CSS
│   ├── layout/
│   │   └── main.ejs         # Layout principal
│   └── pages/
│       ├── page1.ejs        # Página de usuários
│       └── page2.ejs        # Página sobre
├── tests/
│   ├── fixtures/            # Dados de teste
│   ├── helpers/             # Utilitários de teste
│   └── *.test.js           # Arquivos de teste
├── scripts/
│   ├── migrate-dev.sql     # Migração para desenvolvimento
│   ├── migrate-prod.sql    # Migração para produção
│   └── runMigration.js     # Executor de migrações
└── server.js               # Servidor principal
```

## 🧪 Testes

O projeto inclui testes completos usando **mocks** para facilitar o aprendizado:

- **Testes de Unidade**: Controllers, Services, Models, Repositories com mocks
- **Testes de Rotas**: Endpoints da API usando SuperTest e mocks
- **Sem Dependências Externas**: Não requer configuração de banco de dados para testes
- **Cobertura**: Relatório detalhado de cobertura de código
- **Padrão AAA**: Arrange-Act-Assert para testes claros e organizados

## 🔧 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker, Docker Compose
- **Interface DB**: Adminer
- **Template Engine**: EJS
- **Validação**: Joi
- **Testes**: Jest, Supertest
- **Desenvolvimento**: Nodemon
- **UUID**: Para chaves primárias

## 📊 Scripts Disponíveis

### Aplicação
- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com auto-reload

### Testes
- `npm test` - Executa todos os testes
- `npm run test:coverage` - Executa testes com relatório de cobertura

### Docker & Banco de Dados
- `npm run docker:up` - Sobe PostgreSQL e Adminer
- `npm run docker:down` - Para os containers
- `npm run migrate:dev` - Executa migração de desenvolvimento (com dados de teste)
- `npm run migrate:prod` - Executa migração de produção (sem dados de teste)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.