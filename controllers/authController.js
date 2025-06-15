const authService = require('../services/authService');
const Joi = require('joi');

const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().optional()
});

const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


class AuthController {
  async signUp(req, res) {
    try {
      const { error } = signUpSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const { email, password, name } = req.body;
      const userData = name ? { name } : {};

      const result = await authService.signUp(email, password, userData);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: result.user,
        session: result.session
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async signIn(req, res) {
    try {
      const { error } = signInSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details[0].message
        });
      }

      const { email, password } = req.body;
      const result = await authService.signIn(email, password);

      req.session = result.session;

      res.json({
        message: 'Login realizado com sucesso',
        user: result.user,
        session: result.session
      });
    } catch (error) {
      res.status(401).json({
        error: error.message
      });
    }
  }

  async signOut(req, res) {
    try {
      await authService.signOut();
      req.session = null;

      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        return res.status(401).json({
          error: 'Usuário não autenticado'
        });
      }

      res.json({
        user
      });
    } catch (error) {
      res.status(401).json({
        error: error.message
      });
    }
  }

  async refreshSession(req, res) {
    try {
      const result = await authService.refreshSession();

      req.session = result.session;

      res.json({
        message: 'Sessão renovada com sucesso',
        user: result.user,
        session: result.session
      });
    } catch (error) {
      res.status(401).json({
        error: error.message
      });
    }
  }

}

module.exports = new AuthController();