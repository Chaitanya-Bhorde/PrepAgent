const mongoose = require('mongoose');
const { connectPostgres } = require('./postgresDb');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connect and sync relational Postgres/SQLite
    await connectPostgres();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

