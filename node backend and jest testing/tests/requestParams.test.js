const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/requestParams'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO request_params')) {
      callback(null, { insertId: 1 }); 
    } else if (sql.includes('SELECT * FROM request_params')) {
      callback(null, [
        { param_id: 1, request_id: 1, key: 'testKey', value: 'testValue' }
      ]); 
    } else if (sql.includes('SELECT * FROM request_params WHERE param_id = ?')) {
      callback(null, [{ param_id: 1, request_id: 1, key: 'testKey', value: 'testValue' }]); 
    } else if (sql.includes('UPDATE request_params')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM request_params')) {
      callback(null, { affectedRows: 1 }); 
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/requestParams', router);

describe('Request Params API Tests', () => {

  // Create 
  it('should create a new request param', async () => {
    const newRequestParam = { request_id: 1, key: 'testKey', value: 'testValue' };
    const response = await request(app).post('/api/requestParams').send(newRequestParam);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.key).toBe('testKey');
    expect(response.body.value).toBe('testValue');
  });


  // Get 
  it('should fetch a request param by ID', async () => {
    const response = await request(app).get('/api/requestParams/1');
    expect(response.status).toBe(200);
    expect(response.body.key).toBe('testKey');
    expect(response.body.value).toBe('testValue');
  });

  // Update 
  it('should update a request param', async () => {
    const updatedRequestParam = { key: 'updatedKey', value: 'updatedValue' };
    const response = await request(app).put('/api/requestParams/1').send(updatedRequestParam);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Param updated successfully');
  });

  // Delete 
  it('should delete a request param', async () => {
    const response = await request(app).delete('/api/requestParams/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Param deleted successfully');
  });

});
