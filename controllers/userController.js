class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async getUserById(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const user = await this.userService.getUserById(req.params.id);
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async createUser(req, res) {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Dados do usuário são obrigatórios' });
      }

      const userData = req.body;
      const newUser = await this.userService.createUser(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async updateUser(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Dados para atualização são obrigatórios' });
      }

      const userData = req.body;
      const updatedUser = await this.userService.updateUser(req.params.id, userData);
      if (updatedUser) {
        return res.status(200).json(updatedUser);
      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async deleteUser(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const deletedUser = await this.userService.deleteUser(req.params.id);
      if (deletedUser) {
        return res.status(200).json({ message: 'Usuário deletado com sucesso', user: deletedUser });
      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      this._handleError(error, res);
    }
  }

  _handleError(error, res) {
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
}

module.exports = UserController;
