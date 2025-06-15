const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const runMigration = async (environment) => {
  const fileName = environment === 'prod' ? 'migrate-prod.sql' : 'migrate-dev.sql';
  const filePath = path.join(__dirname, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo de migração não encontrado: ${fileName}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    console.log(`Executando migração para ${environment.toUpperCase()}...`);
    await pool.query(sql);
    console.log(`✅ Migração ${environment.toUpperCase()} executada com sucesso!`);
  } catch (err) {
    console.error(`❌ Erro ao executar migração ${environment.toUpperCase()}:`, err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

const environment = process.argv[2];

if (!environment || !['dev', 'prod'].includes(environment)) {
  console.error('❌ Uso: node runMigration.js [dev|prod]');
  process.exit(1);
}

runMigration(environment);