const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/collections'); 

// Mocking the database query  (fake data populate karo)
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO collections')) {  // simulate karo naye connection ko
      callback(null, { insertId: 1 });
    } else if (sql.includes('SELECT * FROM collections')) {
      callback(null, [
        { collection_id: 1, collection_name: 'Test Collection', workspace_id: 1, created_by: 'user1' }
      ]);
    } else if (sql.includes('SELECT * FROM collections WHERE collection_id = ?')) {
      callback(null, [{ collection_id: 1, collection_name: 'Test Collection', workspace_id: 1, created_by: 'user1' }]);
    } else if (sql.includes('UPDATE collections')) {
      callback(null, { affectedRows: 1 });
    } else if (sql.includes('DELETE FROM collections')) {
      callback(null, { affectedRows: 1 });
    } else {
      callback(new Error('Unknown query'));  // unexpected query yaha catch karege
    }
  }
}));

app.use(express.json());
app.use('/api/collections', router);

describe('Collections API Tests', () => {

  // Create 
  it('should create a new collection', async () => {
    const collection = { collection_name: 'Test Collection', workspace_id: 1, created_by: 'user1' };
    const response = await request(app).post('/api/collections').send(collection);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.collection_name).toBe('Test Collection');
  });


  // Get 
  it('should fetch a collection by ID', async () => {
    const response = await request(app).get('/api/collections/1');
    expect(response.status).toBe(200);
    expect(response.body.collection_name).toBe('Test Collection');
  });

  // Update
  it('should update a collection', async () => {
    const updatedCollection = { collection_name: 'Updated Collection' };
    const response = await request(app).put('/api/collections/1').send(updatedCollection);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Collection updated successfully');
  });

  // Delete
  it('should delete a collection', async () => {
    const response = await request(app).delete('/api/collections/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Collection deleted successfully');
  });

});
