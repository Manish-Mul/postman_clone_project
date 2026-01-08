const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

// backend.exe is in: src-tauri/target/debug/backend/backend.exe
// .env is in:        src-tauri/backend/.env

const exeDir = path.dirname(process.execPath);
const envPath = path.resolve(exeDir, '..', '..', '..', 'backend', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env not found at:', envPath);
  process.exit(1);
}

require('dotenv').config({ path: envPath, override: true });

const required = ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME','DB_PORT'];
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error('❌ Missing env vars:', missing.join(', '));
  process.exit(1);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL Connected...');
});

module.exports = db;
