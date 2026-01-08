const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/workspaces'); 

// Mocking the database query method
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    console.log('Mocked query:', sql, params); 

    if (sql.includes('INSERT INTO workspaces')) {
      callback(null, { insertId: 1 });
    } else if (sql.includes('SELECT * FROM workspaces')) {
      callback(null, [
        { workspace_id: 1, workspace_name: 'Test Workspace', created_by: 'user1' }
      ]);
    } else if (sql.includes('SELECT * FROM workspaces WHERE workspace_id = ?')) {
      callback(null, [{ workspace_id: 1, workspace_name: 'Test Workspace', created_by: 'user1' }]);
    } else if (sql.includes('UPDATE workspaces')) {
      callback(null);
    } else if (sql.includes('DELETE FROM workspaces')) {
      callback(null);
    } else {
      callback(new Error('Unknown query'));
    }
  }
}));

app.use(express.json());
app.use('/api/workspaces', router);

describe('Workspaces API Tests', () => {

  // Create 
  it('should create a new workspace', async () => {
    const workspace = { workspace_name: 'Test Workspace', created_by: 'user1' };
    const response = await request(app).post('/api/workspaces').send(workspace);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.workspace_name).toBe('Test Workspace');
  });

  // Get 
  it('should fetch a workspace by ID', async () => {
    const response = await request(app).get('/api/workspaces/1');
    expect(response.status).toBe(200);
    expect(response.body.workspace_name).toBe('Test Workspace');
  });

  // Update
  it('should update a workspace', async () => {
    const updatedWorkspace = { workspace_name: 'Updated Workspace' };
    const response = await request(app).put('/api/workspaces/1').send(updatedWorkspace);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Workspace updated successfully');
  });

  // Delete 
  it('should delete a workspace', async () => {
    const response = await request(app).delete('/api/workspaces/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Workspace deleted successfully');
  });

});
