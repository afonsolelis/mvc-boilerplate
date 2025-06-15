-- Adicionar coluna owner_id à tabela users
ALTER TABLE users 
ADD COLUMN owner_id VARCHAR(255);

-- Criar índice para melhorar performance nas consultas por owner
CREATE INDEX idx_users_owner_id ON users(owner_id);

-- Comentário da coluna
COMMENT ON COLUMN users.owner_id IS 'ID do usuário proprietário (Supabase auth user ID)';