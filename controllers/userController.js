const ErrorHandler = require('../helpers/errorHandler');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAllUsers(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      const users = await this.userService.getAllUsersByOwner(userId);
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

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = await this.userService.getUserByIdAndOwner(req.params.id, userId);
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

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const userData = { ...req.body, owner_id: userId };
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

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const userData = req.body;
      const updatedUser = await this.userService.updateUserByOwner(req.params.id, userData, userId);
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

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const deletedUser = await this.userService.deleteUserByOwner(req.params.id, userId);
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
