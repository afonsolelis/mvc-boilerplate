const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Usuários',
    content: path.join(__dirname, '../views/pages/page1')
  });
});

router.get('/about', (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Sobre',
    content: path.join(__dirname, '../views/pages/page2')
  });
});

module.exports = router;
