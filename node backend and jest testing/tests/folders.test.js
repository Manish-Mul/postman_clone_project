const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/folders'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO folders')) {
      callback(null, { insertId: 1 }); 
    } else if (sql.includes('SELECT * FROM folders')) {
      callback(null, [
        { folder_id: 1, folder_name: 'Test Folder', collection_id: 1, created_by: 'testuser' }
      ]); 
    } else if (sql.includes('SELECT * FROM folders WHERE folder_id = ?')) {
      callback(null, [{ folder_id: 1, folder_name: 'Test Folder', collection_id: 1, created_by: 'testuser' }]); 
    } else if (sql.includes('UPDATE folders')) {
      callback(null, { affectedRows: 1 }); 
    } else if (sql.includes('DELETE FROM folders')) {
      callback(null, { affectedRows: 1 });
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/folders', router);

describe('Folders API Tests', () => {

  // Create 
  it('should create a new folder', async () => {
    const newFolder = { folder_name: 'Test Folder', collection_id: 1, created_by: 'testuser' };
    const response = await request(app).post('/api/folders').send(newFolder);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.folder_name).toBe('Test Folder');
  });


  // Get 
  it('should fetch a folder by ID', async () => {
    const response = await request(app).get('/api/folders/1');
    expect(response.status).toBe(200);
    expect(response.body.folder_name).toBe('Test Folder');
  });

  // Update
  it('should update a folder', async () => {
    const updatedFolder = { folder_name: 'Updated Folder' };
    const response = await request(app).put('/api/folders/1').send(updatedFolder);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Folder updated successfully');
  });

  // Delete
  it('should delete a folder', async () => {
    const response = await request(app).delete('/api/folders/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Folder deleted successfully');
  });

});
