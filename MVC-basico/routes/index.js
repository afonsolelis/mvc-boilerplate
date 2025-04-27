const express = require('express');
const router = express.Router();
const home = require('../controllers/homeController');
const about = require('../controllers/aboutController');
const contact = require('../controllers/contactController');

// Rota principal
router.get('/', home.index);

// Rota da página "Sobre"
router.get('/sobre', about.index);

// Rota da página "Contato"
router.get('/contato', contact.index);

module.exports = router;