const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.access_token || 
                  req.session?.access_token;
    
    if (!token) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({
          error: 'Token de acesso requerido'
        });
      } else {
        return res.redirect('/login');
      }
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(401).json({
          error: 'Token inválido ou expirado'
        });
      } else {
        return res.redirect('/login');
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      res.status(401).json({
        error: 'Erro de autenticação'
      });
    } else {
      res.redirect('/login');
    }
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.access_token || 
                  req.session?.access_token;
    
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};