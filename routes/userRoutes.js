const express = require('express');
const router = express.Router();

const UserRepository = require('../repositories/userRepository');
const UserService = require('../services/userService');
const UserController = require('../controllers/userController');

const controller = new UserController(new UserService(new UserRepository()));

router.get('/', controller.getAllUsers.bind(controller));
router.get('/:id', controller.getUserById.bind(controller));
router.post('/', controller.createUser.bind(controller));
router.put('/:id', controller.updateUser.bind(controller));
router.delete('/:id', controller.deleteUser.bind(controller));

module.exports = router;
