const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Store DB inside user data directory (safe for exe)
const dataDir =
  process.env.PORTABLE_EXECUTABLE_DIR ||
  path.join(process.env.APPDATA || process.env.HOME, "postman-clone");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "postman_clone.db");

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
  workspace_id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_name TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections (
  collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_name TEXT NOT NULL,
  workspace_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- FOLDERS must come before requests
CREATE TABLE IF NOT EXISTS folders (
  folder_id INTEGER PRIMARY KEY AUTOINCREMENT,
  folder_name TEXT NOT NULL,
  collection_id INTEGER NOT NULL,
  created_by INTEGER,
  parent_folder_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_name TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  collection_id INTEGER,
  folder_id INTEGER,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE SET NULL,
  FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_headers (
  header_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_params (
  param_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_body (
  body_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER UNIQUE NOT NULL,
  body_type TEXT NOT NULL,
  content TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  response_id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  response_time INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS environments (
  env_id INTEGER PRIMARY KEY AUTOINCREMENT,
  env_name TEXT NOT NULL,
  workspace_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS environment_variables (
  var_id INTEGER PRIMARY KEY AUTOINCREMENT,
  env_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  is_secret INTEGER DEFAULT 0,
  FOREIGN KEY (env_id) REFERENCES environments(env_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS history (
  history_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  workspace_id INTEGER,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers TEXT,
  params TEXT,
  body TEXT,
  response_status INTEGER,
  response_time INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS global_variables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  is_secret INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
`);

console.log("SQLite DB ready at:", dbPath);

module.exports = db;
