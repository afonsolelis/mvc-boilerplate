const express = require('express');
const router = express.Router();
const path = require('path');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

router.get('/about', (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Sobre',
    content: path.join(__dirname, '../views/pages/page2')
  });
});

router.get('/login', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('pages/login');
});

router.get('/register', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('pages/register');
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('pages/dashboard');
});

router.get('/users', authMiddleware, (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Gerenciar Usuários',
    content: path.join(__dirname, '../views/pages/page1')
  });
});

module.exports = router;
