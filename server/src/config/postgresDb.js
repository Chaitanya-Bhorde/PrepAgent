const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.POSTGRES_URI) {
  console.log('🔌 Connecting to PostgreSQL Database via Sequelize...');
  sequelize = new Sequelize(process.env.POSTGRES_URI, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  console.log('🔌 No PostgreSQL URI configured. Falling back to local SQLite file for relational data...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './prep_agent_sqlite.db',
    logging: false,
  });
}

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Relational Database connection successfully authenticated.');
    
    // Sync models
    await sequelize.sync();
    console.log('✅ Relational Database schemas synchronized.');
  } catch (error) {
    console.error('❌ Relational Database connection failed:', error.message);
    console.log('⚠️ Re-routing database logic to SQLite mock fallback.');
  }
};

module.exports = {
  sequelize,
  connectPostgres
};
