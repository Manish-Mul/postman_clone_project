const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/environmentVars'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO environment_variables')) {
      callback(null, { insertId: 1 }); 
    } else if (sql.includes('SELECT * FROM environment_variables')) {
      callback(null, [
        { variable_id: 1, env_id: 1, key: 'API_URL', value: 'https://api.example.com' }
      ]); 
    } else if (sql.includes('SELECT * FROM environment_variables WHERE variable_id = ?')) {
      callback(null, [{ variable_id: 1, env_id: 1, key: 'API_URL', value: 'https://api.example.com' }]); 
    } else if (sql.includes('UPDATE environment_variables')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM environment_variables')) {
      callback(null, { affectedRows: 1 });
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/environmentVars', router);

describe('Environment Variables API Tests', () => {

  // Create
  it('should create a new environment variable', async () => {
    const newEnvVar = { env_id: 1, key: 'API_URL', value: 'https://api.example.com' };
    const response = await request(app).post('/api/environmentVars').send(newEnvVar);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.key).toBe('API_URL');
    expect(response.body.value).toBe('https://api.example.com');
  });


  // Get 
  it('should fetch an environment variable by ID', async () => {
    const response = await request(app).get('/api/environmentVars/1');
    expect(response.status).toBe(200);
    expect(response.body.key).toBe('API_URL');
  });

  // Update
  it('should update an environment variable', async () => {
    const updatedEnvVar = { key: 'NEW_API_URL', value: 'https://new-api.example.com' };
    const response = await request(app).put('/api/environmentVars/1').send(updatedEnvVar);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Environment variable updated successfully');
  });

  // Delete
  it('should delete an environment variable', async () => {
    const response = await request(app).delete('/api/environmentVars/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Environment variable deleted successfully');
  });

});
