const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const UserRepository = require('../repositories/userRepository');
const UserService = require('../services/userService');
const UserController = require('../controllers/userController');

const controller = new UserController(new UserService(new UserRepository()));

router.get('/', authMiddleware, controller.getAllUsers.bind(controller));
router.get('/:id', authMiddleware, controller.getUserById.bind(controller));
router.post('/', authMiddleware, controller.createUser.bind(controller));
router.put('/:id', authMiddleware, controller.updateUser.bind(controller));
router.delete('/:id', authMiddleware, controller.deleteUser.bind(controller));

module.exports = router;
