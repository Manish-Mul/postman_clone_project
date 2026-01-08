const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/requestHeaders'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); // Log SQL queries for debugging

    // Mocking different queries based on the SQL statement
    if (sql.includes('INSERT INTO request_headers')) {
      callback(null, { insertId: 1 }); // Simulate successful insert
    } else if (sql.includes('SELECT * FROM request_headers')) {
      callback(null, [
        { header_id: 1, request_id: 1, key: 'Content-Type', value: 'application/json' }
      ]); // Simulate retrieving all request headers
    } else if (sql.includes('SELECT * FROM request_headers WHERE header_id = ?')) {
      callback(null, [{ header_id: 1, request_id: 1, key: 'Content-Type', value: 'application/json' }]); // Simulate fetching by ID
    } else if (sql.includes('UPDATE request_headers')) {
      callback(null, { affectedRows: 1 }); // Simulate successful update
    } else if (sql.includes('DELETE FROM request_headers')) {
      callback(null, { affectedRows: 1 }); // Simulate successful deletion
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/requestHeaders', router);

describe('Request Headers API Tests', () => {

  // Create 
  it('should create a new request header', async () => {
    const newRequestHeader = { request_id: 1, key: 'Content-Type', value: 'application/json' };
    const response = await request(app).post('/api/requestHeaders').send(newRequestHeader);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.key).toBe('Content-Type');
    expect(response.body.value).toBe('application/json');
  });


  // Get 
  it('should fetch a request header by ID', async () => {
    const response = await request(app).get('/api/requestHeaders/1');
    expect(response.status).toBe(200);
    expect(response.body.key).toBe('Content-Type');
    expect(response.body.value).toBe('application/json');
  });

  // Update
  it('should update a request header', async () => {
    const updatedRequestHeader = { key: 'Authorization', value: 'Bearer token' };
    const response = await request(app).put('/api/requestHeaders/1').send(updatedRequestHeader);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Header updated successfully');
  });

  // Delete 
  it('should delete a request header', async () => {
    const response = await request(app).delete('/api/requestHeaders/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Header deleted successfully');
  });

});
