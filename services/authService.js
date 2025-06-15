const supabase = require('../config/supabase');

class AuthService {
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: userData
        }
      });

      if (error) {
        throw error;
      }

      // Para cadastro simples sem confirmação de email
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return user;
    } catch (error) {
      throw new Error(`Erro ao obter usuário atual: ${error.message}`);
    }
  }

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      throw new Error(`Erro ao renovar sessão: ${error.message}`);
    }
  }


  async verifyToken(token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error) {
        throw error;
      }
      
      return data.user;
    } catch (error) {
      throw new Error(`Token inválido: ${error.message}`);
    }
  }
}

module.exports = new AuthService();