const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/environments'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO environments')) {
      callback(null, { insertId: 1 }); 
    } else if (sql.includes('SELECT * FROM environments')) {
      callback(null, [
        { env_id: 1, env_name: 'Test Environment', workspace_id: 1, created_by: 'user1' }
      ]); 
    } else if (sql.includes('SELECT * FROM environments WHERE env_id = ?')) {
      callback(null, [{ env_id: 1, env_name: 'Test Environment', workspace_id: 1, created_by: 'user1' }]); 
    } else if (sql.includes('UPDATE environments')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM environments')) {
      callback(null, { affectedRows: 1 }); 
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/environments', router);

describe('Environments API Tests', () => {

  // Create
  it('should create a new environment', async () => {
    const envData = { env_name: 'Test Environment', workspace_id: 1, created_by: 'user1' };
    const response = await request(app).post('/api/environments').send(envData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.env_name).toBe('Test Environment');
  });
  

  // Get
  it('should fetch an environment by ID', async () => {
    const response = await request(app).get('/api/environments/1');
    expect(response.status).toBe(200);
    expect(response.body.env_name).toBe('Test Environment');
  });

  // Update 
  it('should update an environment', async () => {
    const updatedEnv = { env_name: 'Updated Environment' };
    const response = await request(app).put('/api/environments/1').send(updatedEnv);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Environment updated successfully');
  });

  // Delete
  it('should delete an environment', async () => {
    const response = await request(app).delete('/api/environments/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Environment deleted successfully');
  });

});
