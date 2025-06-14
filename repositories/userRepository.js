const db = require('../config/db');

class UserRepository {
  constructor() {
    this.db = db;
  }

  async findAll() {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      const result = await this.db.query('SELECT * FROM users ORDER BY id');
      return result.rows || [];
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '42P01') {
        throw new Error('Tabela de usuários não encontrada');
      }
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!id) {
        throw new Error('ID é obrigatório para busca');
      }

      const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!userData || !userData.name || !userData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      const result = await this.db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('Falha ao criar usuário no banco de dados');
      }

      return result.rows[0];
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      if (error.code === '23502') {
        throw new Error('Dados obrigatórios não fornecidos');
      }
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async update(id, userData) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!id) {
        throw new Error('ID é obrigatório para atualização');
      }

      if (!userData || typeof userData !== 'object') {
        throw new Error('Dados para atualização são obrigatórios');
      }

      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(userData.name);
      }
      if (userData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }

      if (fields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      values.push(id);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await this.db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      if (error.message.includes('obrigatório') || error.message.includes('Nenhum campo')) {
        throw error;
      }
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!id) {
        throw new Error('ID é obrigatório para exclusão');
      }

      const result = await this.db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!email) {
        throw new Error('Email é obrigatório para busca');
      }

      const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }
}

module.exports = UserRepository;