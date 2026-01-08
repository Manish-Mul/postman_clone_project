const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/requestBody'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

  
    if (sql.includes('INSERT INTO request_body')) {
      callback(null, { insertId: 1 });
    } else if (sql.includes('SELECT * FROM request_body')) {
      callback(null, [
        { body_id: 1, request_id: 1, body_type: 'json', content: '{"key":"value"}' }
      ]);
    } else if (sql.includes('SELECT * FROM request_body WHERE body_id = ?')) {
      callback(null, [{ body_id: 1, request_id: 1, body_type: 'json', content: '{"key":"value"}' }]); 
    } else if (sql.includes('UPDATE request_body')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM request_body')) {
      callback(null, { affectedRows: 1 }); 
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/requestBody', router);

describe('Request Body API Tests', () => {

  // Create 
  it('should create a new request body', async () => {
    const newRequestBody = { request_id: 1, body_type: 'json', content: '{"key":"value"}' };
    const response = await request(app).post('/api/requestBody').send(newRequestBody);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.body_type).toBe('json');
    expect(response.body.content).toBe('{"key":"value"}');
  });


  // Get 
  it('should fetch a request body by ID', async () => {
    const response = await request(app).get('/api/requestBody/1');
    expect(response.status).toBe(200);
    expect(response.body.body_type).toBe('json');
    expect(response.body.content).toBe('{"key":"value"}');
  });

  // Update 
  it('should update a request body', async () => {
    const updatedRequestBody = { body_type: 'xml', content: '<key>value</key>' };
    const response = await request(app).put('/api/requestBody/1').send(updatedRequestBody);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Body updated successfully');
  });

  // Delete
  it('should delete a request body', async () => {
    const response = await request(app).delete('/api/requestBody/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Body deleted successfully');
  });

});
