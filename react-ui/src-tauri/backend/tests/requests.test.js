const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/requests'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO requests')) {
      callback(null, { insertId: 1 });
    } else if (sql.includes('SELECT * FROM requests')) {
      callback(null, [
        { request_id: 1, request_name: 'Test Request', method: 'GET', url: 'https://api.test.com', collection_id: 1, folder_id: 1, created_by: 'user1' }
      ]);
    } else if (sql.includes('SELECT * FROM requests WHERE request_id = ?')) {
      callback(null, [{ request_id: 1, request_name: 'Test Request', method: 'GET', url: 'https://api.test.com', collection_id: 1, folder_id: 1, created_by: 'user1' }]);
    } else if (sql.includes('UPDATE requests')) {
      callback(null, { affectedRows: 1 });
    } else if (sql.includes('DELETE FROM requests')) {
      callback(null, { affectedRows: 1 });
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/requests', router);

describe('Requests API Tests', () => {

  // Create 
  it('should create a new request', async () => {
    const requestData = { request_name: 'Test Request', method: 'GET', url: 'https://api.test.com', collection_id: 1, folder_id: 1, created_by: 'user1' };
    const response = await request(app).post('/api/requests').send(requestData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.request_name).toBe('Test Request');
  });


  // Get
  it('should fetch a request by ID', async () => {
    const response = await request(app).get('/api/requests/1');
    expect(response.status).toBe(200);
    expect(response.body.request_name).toBe('Test Request');
  });

  // Update 
  it('should update a request', async () => {
    const updatedRequest = { request_name: 'Updated Request', url: 'https://api.updated.com' };
    const response = await request(app).put('/api/requests/1').send(updatedRequest);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Request updated successfully');
  });

  // Delete
  it('should delete a request', async () => {
    const response = await request(app).delete('/api/requests/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Request deleted successfully');
  });

});
