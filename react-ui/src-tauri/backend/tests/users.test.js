const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/users');

// Mock the database module to return sample data
jest.mock('../db', () => ({
  query: (sql, params, callback) => {
    if (sql.includes('SELECT * FROM users')) {
      callback(null, [{ user_id: 1, username: 'testuser', email: 'test@example.com' }]); 
    } else if (sql.includes('INSERT INTO users')) {
      callback(null, { insertId: 1 });
    } else if (sql.includes('UPDATE users')) {
      callback(null); 
    } else if (sql.includes('DELETE FROM users')) {
      callback(null);
    } else {
      callback(new Error('Database error'));
    }
  }
}));

app.use(express.json());
app.use('/api/users', router);

describe('User API tests', () => {

  // Create 
  it('should create a new user', async () => {
    const user = { username: 'testuser', email: 'test@example.com', password_hash: 'hashedpassword123' };
    const response = await request(app).post('/api/users').send(user);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe('testuser');
    expect(response.body.email).toBe('test@example.com');
  });


  // Get
  it('should fetch a user by ID', async () => {
    const response = await request(app).get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('testuser');
  });

  // Update
  it('should update a user', async () => {
    const updatedUser = { username: 'updateduser', email: 'updated@example.com' };
    const response = await request(app).put('/api/users/1').send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully'); 
  });

  // Delete 
  it('should delete a user', async () => {
    const response = await request(app).delete('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully'); 
  });
});
