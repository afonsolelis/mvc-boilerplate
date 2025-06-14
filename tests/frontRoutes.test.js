const request = require('supertest');
const express = require('express');
const path = require('path');
const frontRoutes = require('../routes/frontRoutes');

describe('Front Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    
    // Mock da função render para evitar erro de template
    app.use((req, res, next) => {
      res.render = jest.fn((template, data, callback) => {
        if (callback) {
          callback(null, `Mock rendered: ${template}`);
        } else {
          res.send(`Mock rendered: ${template}`);
        }
      });
      next();
    });
    
    app.use('/', frontRoutes);
  });

  describe('GET /', () => {
    test('deve renderizar a página inicial', async () => {
      // Act
      const res = await request(app).get('/');

      // Assert
      expect(res.status).toBe(200);
      expect(res.text).toContain('Mock rendered:');
    });
  });

  describe('GET /about', () => {
    test('deve renderizar a página sobre', async () => {
      // Act
      const res = await request(app).get('/about');

      // Assert
      expect(res.status).toBe(200);
      expect(res.text).toContain('Mock rendered:');
    });
  });
});