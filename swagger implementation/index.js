const express = require("express");
const swaggerDocs = require('./swagger');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require("./db");
const authRoutes = require('./routes/auth');

// Swagger 
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Postman Clone API',
      version: '1.0.0',
      description: 'API documentation for Postman Clone backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};


const specs = swaggerJsdoc(options);

// Import routes
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
const setupSwaggerDocs = require("./swagger");

const app = express();

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Mount routes
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

setupSwaggerDocs(app);

module.exports = app;

if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
