
DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `collection_id` int NOT NULL AUTO_INCREMENT,
  `collection_name` varchar(150) NOT NULL,
  `workspace_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`),
  KEY `workspace_id` (`workspace_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `collections_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE,
  CONSTRAINT `collections_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `environment_variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `environment_variables` (
  `var_id` int NOT NULL AUTO_INCREMENT,
  `env_id` int NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(1000) DEFAULT NULL,
  `is_secret` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`var_id`),
  KEY `env_id` (`env_id`),
  CONSTRAINT `environment_variables_ibfk_1` FOREIGN KEY (`env_id`) REFERENCES `environments` (`env_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


DROP TABLE IF EXISTS `environments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `environments` (
  `env_id` int NOT NULL AUTO_INCREMENT,
  `env_name` varchar(150) NOT NULL,
  `workspace_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`env_id`),
  KEY `workspace_id` (`workspace_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `environments_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE CASCADE,
  CONSTRAINT `environments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `folder_id` int NOT NULL AUTO_INCREMENT,
  `folder_name` varchar(150) NOT NULL,
  `collection_id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `parent_folder_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`folder_id`),
  KEY `collection_id` (`collection_id`),
  KEY `parent_folder_id` (`parent_folder_id`),
  CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`collection_id`) ON DELETE CASCADE,
  CONSTRAINT `folders_ibfk_2` FOREIGN KEY (`parent_folder_id`) REFERENCES `folders` (`folder_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `global_variables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_variables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text,
  `is_secret` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_key` (`user_id`,`key`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `workspace_id` int DEFAULT NULL,
  `method` varchar(10) NOT NULL,
  `url` text NOT NULL,
  `headers` text,
  `params` text,
  `body` text,
  `response_status` int DEFAULT NULL,
  `response_time` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `history_ibfk_2` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`workspace_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `request_body`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_body` (
  `body_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `body_type` enum('raw','form-data','x-www-form-urlencoded','binary') NOT NULL,
  `content` text,
  PRIMARY KEY (`body_id`),
  UNIQUE KEY `request_id` (`request_id`),
  CONSTRAINT `request_body_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;


DROP TABLE IF EXISTS `request_headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_headers` (
  `header_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`header_id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `request_headers_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `request_params`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_params` (
  `param_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`param_id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `request_params_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `request_name` varchar(200) NOT NULL,
  `method` enum('GET','POST','PUT','DELETE','PATCH') NOT NULL,
  `url` varchar(1000) NOT NULL,
  `collection_id` int DEFAULT NULL,
  `folder_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `collection_id` (`collection_id`),
  KEY `folder_id` (`folder_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`collection_id`) ON DELETE SET NULL,
  CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`folder_id`) ON DELETE SET NULL,
  CONSTRAINT `requests_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responses` (
  `response_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `status_code` int DEFAULT NULL,
  `response_body` text,
  `response_time_ms` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`response_id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`request_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `workspaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workspaces` (
  `workspace_id` int NOT NULL AUTO_INCREMENT,
  `workspace_name` varchar(150) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`workspace_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `workspaces_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
