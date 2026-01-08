-- Drop and recreate database
DROP DATABASE IF EXISTS postman_clone_db;
CREATE DATABASE postman_clone_db;
USE postman_clone_db;

-- 1. USERS
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. WORKSPACES
CREATE TABLE workspaces (
  workspace_id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_name VARCHAR(150) NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. COLLECTIONS
CREATE TABLE collections (
  collection_id INT AUTO_INCREMENT PRIMARY KEY,
  collection_name VARCHAR(150) NOT NULL,
  workspace_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. FOLDERS
CREATE TABLE folders (
  folder_id INT AUTO_INCREMENT PRIMARY KEY,
  folder_name VARCHAR(150) NOT NULL,
  collection_id INT NOT NULL,
  parent_folder_id INT DEFAULT NULL,
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. REQUESTS
CREATE TABLE requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  request_name VARCHAR(200) NOT NULL,
  method ENUM('GET','POST','PUT','DELETE','PATCH') NOT NULL,
  url VARCHAR(1000) NOT NULL,
  collection_id INT DEFAULT NULL,
  folder_id INT DEFAULT NULL,
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE SET NULL,
  FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. REQUEST_HEADERS
CREATE TABLE request_headers (
  header_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  `key` VARCHAR(200) NOT NULL,
  `value` VARCHAR(1000),
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. REQUEST_PARAMS
CREATE TABLE request_params (
  param_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  `key` VARCHAR(200) NOT NULL,
  `value` VARCHAR(1000),
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. REQUEST_BODY
CREATE TABLE request_body (
  body_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL UNIQUE,
  body_type ENUM('raw','form-data','x-www-form-urlencoded','binary') NOT NULL,
  content TEXT,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. RESPONSES
CREATE TABLE responses (
  response_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  status_code INT,
  response_body TEXT,
  response_time_ms INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. ENVIRONMENTS
CREATE TABLE environments (
  env_id INT AUTO_INCREMENT PRIMARY KEY,
  env_name VARCHAR(150) NOT NULL,
  workspace_id INT NOT NULL,
  created_by INT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. ENVIRONMENT_VARIABLES
CREATE TABLE environment_variables (
  var_id INT AUTO_INCREMENT PRIMARY KEY,
  env_id INT NOT NULL,
  `key` VARCHAR(200) NOT NULL,
  `value` VARCHAR(1000),
  FOREIGN KEY (env_id) REFERENCES environments(env_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Request Execution / History
CREATE TABLE request_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workspace_id INT NOT NULL,
    method ENUM('GET','POST','PUT','DELETE','PATCH') NOT NULL,
    url VARCHAR(1000) NOT NULL,
    headers JSON NULL,
    params JSON NULL,
    body LONGTEXT NULL,
    response_status INT NULL,
    response_time_ms INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(workspace_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

--------------------------------------------------------------------------------
-- Insert sample data (5–10 rows per table)
--------------------------------------------------------------------------------
INSERT INTO users (username, email, password_hash) VALUES
('alice','alice@example.com','hash1'),
('bob','bob@example.com','hash2'),
('carol','carol@example.com','hash3'),
('dave','dave@example.com','hash4'),
('erin','erin@example.com','hash5');

INSERT INTO workspaces (workspace_name, created_by) VALUES
('Alice Workspace',1),
('Team API',2),
('Public Demo',3);

INSERT INTO collections (collection_name, workspace_id, created_by) VALUES
('Auth APIs',1,1),
('Payment APIs',2,2),
('Product APIs',2,2),
('Demo APIs',3,3);

INSERT INTO folders (folder_name, collection_id, parent_folder_id) VALUES
('Login',1,NULL),
('Signup',1,NULL),
('Payments v1',2,NULL),
('Admin Products',3,NULL),
('Public Products',3,NULL);

INSERT INTO requests (request_name, method, url, collection_id, folder_id, created_by) VALUES
('Login user','POST','https://api.example.com/login',1,1,1),
('Signup user','POST','https://api.example.com/signup',1,2,1),
('Get payment','GET','https://pay.example.com/status/{id}',2,3,2),
('Create payment','POST','https://pay.example.com/create',2,3,2),
('Update product','PUT','https://api.example.com/products/{id}',3,4,2),
('Delete product','DELETE','https://api.example.com/products/{id}',3,4,2),
('List products','GET','https://api.example.com/products',3,5,2),
('Demo info','GET','https://demo.example.com/info',4,NULL,3);

INSERT INTO request_headers (request_id, `key`, `value`) VALUES
(1,'Content-Type','application/json'),
(1,'Accept','application/json'),
(3,'Accept','application/json'),
(4,'Authorization','Bearer {{token}}'),
(5,'Content-Type','application/json');

INSERT INTO request_params (request_id, `key`, `value`) VALUES
(3,'id','123'),
(5,'id','456'),
(7,'page','1');

INSERT INTO request_body (request_id, body_type, content) VALUES
(1,'raw','{"email":"alice@example.com","password":"secret"}'),
(2,'raw','{"email":"bob@example.com","password":"123"}'),
(4,'raw','{"amount":100,"currency":"USD"}');

INSERT INTO responses (request_id,status_code,response_body,response_time_ms) VALUES
(1,200,'{"token":"abc123"}',120),
(4,201,'{"payment_id":"pay_789"}',210),
(3,200,'{"status":"success"}',180),
(7,200,'[{"id":1,"name":"Test"}]',90);

INSERT INTO environments (env_name,workspace_id,created_by) VALUES
('Alice Dev',1,1),
('Team Dev',2,2),
('Demo Env',3,3);

INSERT INTO environment_variables (env_id,`key`,`value`) VALUES
(1,'base_url','https://api.example.com'),
(1,'api_key','alice-key'),
(2,'base_url','https://pay.example.com'),
(2,'token','team-token'),
(3,'demo_key','demo123');

--------------------------------------------------------------------------------
-- Queries
--------------------------------------------------------------------------------
-- A. Requests created by user_id=1
SELECT * FROM requests WHERE created_by=1;

-- B. All POST requests
SELECT * FROM requests WHERE method='POST';

-- C. Count requests in each collection
SELECT c.collection_name, COUNT(r.request_id) AS total_requests
FROM collections c
LEFT JOIN requests r ON r.collection_id=c.collection_id
GROUP BY c.collection_name;

-- D. Count collections by each user
SELECT u.username, COUNT(c.collection_id) AS collections_count
FROM users u
LEFT JOIN collections c ON c.created_by=u.user_id
GROUP BY u.username;

-- E. Collection + Workspace + Owner
SELECT c.collection_name, w.workspace_name, u.username AS owner
FROM collections c
JOIN workspaces w ON c.workspace_id=w.workspace_id
JOIN users u ON w.created_by=u.user_id;

-- F. All environment variables for workspace_id=2
SELECT ev.* FROM environment_variables ev
JOIN environments e ON ev.env_id=e.env_id
WHERE e.workspace_id=2;

-- G. Users who never created any request
SELECT u.* FROM users u
LEFT JOIN requests r ON u.user_id=r.created_by
WHERE r.request_id IS NULL;

-- H. Last 5 requests created (simulate execution time with created_at)
SELECT * FROM requests ORDER BY created_at DESC LIMIT 5;

-- I. Workspace with highest number of requests
SELECT w.workspace_name, COUNT(r.request_id) AS total_requests
FROM workspaces w
JOIN collections c ON w.workspace_id=c.workspace_id
JOIN requests r ON c.collection_id=r.collection_id
GROUP BY w.workspace_id
ORDER BY total_requests DESC
LIMIT 1;

-- J. Collections that contain DELETE requests
SELECT DISTINCT c.collection_name
FROM collections c
JOIN requests r ON c.collection_id=r.collection_id
WHERE r.method='DELETE';

--------------------------------------------------------------------------------
-- Update & Delete
--------------------------------------------------------------------------------
-- Update request URL
UPDATE requests SET url='https://pay.example.com/v2/status/{id}' WHERE request_id=3;

-- Delete responses older than 30 days (example condition)
DELETE FROM responses WHERE created_at < NOW() - INTERVAL 30 DAY;

--------------------------------------------------------------------------------
-- Constraint Test (this should fail)
--------------------------------------------------------------------------------
INSERT INTO requests (request_name, method, url, collection_id, created_by)
VALUES ('InvalidReq','GET','https://invalid.com',999,1);
