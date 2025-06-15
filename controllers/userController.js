const ErrorHandler = require('../helpers/errorHandler');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAllUsers(req, res) {
    try {
      const users = await this.userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res);
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
      ErrorHandler.handleControllerError(error, res);
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
      ErrorHandler.handleControllerError(error, res);
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
      ErrorHandler.handleControllerError(error, res);
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
      ErrorHandler.handleControllerError(error, res);
    }
  }

}

module.exports = UserController;
