const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/responses'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params);

    if (sql.includes('INSERT INTO responses')) {
      callback(null, { insertId: 1 }); 
    } else if (sql.includes('SELECT * FROM responses')) {
      callback(null, [
        { response_id: 1, request_id: 1, status_code: 200, response_body: 'OK', response_time_ms: 120 }
      ]); 
    } else if (sql.includes('SELECT * FROM responses WHERE response_id = ?')) {
      callback(null, [{ response_id: 1, request_id: 1, status_code: 200, response_body: 'OK', response_time_ms: 120 }]); 
    } else if (sql.includes('UPDATE responses')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM responses')) {
      callback(null, { affectedRows: 1 }); 
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/responses', router);

describe('Responses API Tests', () => {

  // Create 
  it('should create a new response', async () => {
    const responseData = { request_id: 1, status_code: 200, response_body: 'OK', response_time_ms: 120 };
    const response = await request(app).post('/api/responses').send(responseData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status_code).toBe(200);
  });


  // Get 
  it('should fetch a response by ID', async () => {
    const response = await request(app).get('/api/responses/1');
    expect(response.status).toBe(200);
    expect(response.body.status_code).toBe(200);
  });

  // Update
  it('should update a response', async () => {
    const updatedResponse = { response_body: 'Updated Response Body' };
    const response = await request(app).put('/api/responses/1').send(updatedResponse);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Response updated successfully');
  });

  // Delete 
  it('should delete a response', async () => {
    const response = await request(app).delete('/api/responses/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Response deleted successfully');
  });

});
