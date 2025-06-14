const express = require('express');
const userRoutes = require('../routes/userRoutes');

describe('User Routes Module', () => {
  test('deve exportar router com rotas configuradas', () => {
    // Arrange & Act
    const app = express();
    app.use('/users', userRoutes);

    // Assert
    expect(userRoutes).toBeDefined();
    expect(typeof userRoutes).toBe('function');
    expect(userRoutes.stack).toBeDefined();
    expect(userRoutes.stack.length).toBeGreaterThan(0);
  });

  test('deve ter todas as rotas configuradas', () => {
    // Arrange
    const routes = [];
    userRoutes.stack.forEach(layer => {
      if (layer.route) {
        routes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      }
    });

    // Assert
    expect(routes).toEqual([
      { path: '/', methods: ['get'] },
      { path: '/:id', methods: ['get'] },
      { path: '/', methods: ['post'] },
      { path: '/:id', methods: ['put'] },
      { path: '/:id', methods: ['delete'] }
    ]);
  });
});