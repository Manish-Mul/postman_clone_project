const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',   
  password: 'manish',    
  database: 'postman_clone_db',
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

module.exports = db;
