const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const cors = require('cors');
const db = require("./db");
const curlRoutes = require("./routes/curl");

// Middleware
app.use(cors({
  origin: ['http://localhost:5173',
    'http://tauri.localhost'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// FIXED: wildcard using regex instead of "*"
app.options(/.*/, cors({origin: true, credentials: true}));

app.use(express.json());
app.use(bodyParser.json());

// Routes 
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const workspaceRoutes = require("./routes/workspaces");
const collectionRoutes = require("./routes/collections");
const folderRoutes = require("./routes/folders");
const requestRoutes = require("./routes/requests");
const headerRoutes = require("./routes/requestHeaders");
const paramRoutes = require("./routes/requestParams");
const bodyRoutes = require("./routes/requestBody");
const responseRoutes = require("./routes/responses");
const environmentRoutes = require("./routes/environments");
const envVarRoutes = require("./routes/environmentVars");
const historyRoutes = require("./routes/history");

// Mounting routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/collections", collectionRoutes);
app.use("/folders", folderRoutes);
app.use("/requests", requestRoutes);
app.use("/headers", headerRoutes);
app.use("/params", paramRoutes);
app.use("/bodies", bodyRoutes);
app.use("/responses", responseRoutes);
app.use("/environments", environmentRoutes);
app.use("/variables", envVarRoutes);
app.use("/history", historyRoutes);
app.use("/api", curlRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
