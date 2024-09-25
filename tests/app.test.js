//app.test.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('../app');
const User = require('../models/user');
const Book = require('../models/book');

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {});
});

describe('User Controller', () => {
  describe('POST /api/auth/signup', () => {
	  
    it('should reject invalid email', async () => {
      const userData = { 
        email: 'invalid-email', 
        password: 'StrongPass1'
      };
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      expect(response.status).toBe(400);
	  expect(JSON.parse(response.text)).toHaveProperty('error', 'Invalid email');
    });

    it('should reject invalid password', async () => {
      const userData = { 
        email: 'test@example.com', 
        password: 'weakpass'
      };
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);
      expect(response.status).toBe(400);
	  expect(JSON.parse(response.text)).toHaveProperty('error', 'Invalid password');
    });
	  
    it('should register a new user successfully', async () => {
  const userData = { 
    email: 'test@example.com', 
    password: 'StrongPass1'
  };
  const response = await request(app)
    .post('/api/auth/signup')
    .send(userData);
  expect(response.status).toBe(201);
  expect(JSON.parse(response.text)).toHaveProperty('message', 'User created!');
});
});
});

let authToken;
let userId;
describe('POST /api/auth/login', () => {
  it('should login and return a token in response', async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`; 
    await request(app)
      .post('/api/auth/signup')
      .send({ email: uniqueEmail, password: 'TestPass1' })
      .expect(201);
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'TestPass1' });
    const responseBody = JSON.parse(loginResponse.text);
    expect(loginResponse.status).toBe(200);
    expect(responseBody).toHaveProperty('token');
    const token = responseBody.token;
    expect(token).toBeDefined();
    expect(token.startsWith('eyJ')).toBe(true); // JWT tokens typically start with 'eyJ'
    // Save token and userId for use in subsequent tests
    authToken = token;
	userId = responseBody.userId;
  });
});	

let testBookId;
describe('POST /api/books', () => {
	
	   it('should reject book creation with invalid data', async () => {
      const invalidBookData = {
        // Missing required fields
        author: 'Test Author',
        year: 2023
      };
      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${authToken}`)
        .field('book', JSON.stringify(invalidBookData));
      expect(response.status).toBe(400);
	  expect(JSON.parse(response.text)).toHaveProperty('error');
    }); 
	
  it('should create a new book', (done) => {
    const bookData = {
      userId: userId,
      title: 'Test Book',
      author: 'Test Author',
      year: 2023,
      genre: 'Test Genre',
      ratings: [{ userId: userId, grade: 0 }],
      averageRating: 0
    };
/*console.log('bookData: ', bookData);  
console.log('authToken in Book Controller test: ', authToken);  
console.log('userId in Book Controller test: ', userId);  */
const imagePath = path.join(__dirname, 'testImage.jpg');
    if (!fs.existsSync(imagePath)) {
      return done(new Error('testImage.jpg does not exist'));
    }
    request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${authToken}`)
      .field('book', JSON.stringify(bookData))
      .attach('image', path.join(__dirname, 'testImage.jpg'))
      .then(response => {
/*console.log('Response status:', response.status);
console.log('Response text:', response.text);*/
        expect(response.status).toBe(201);
        expect(JSON.parse(response.text)).toHaveProperty('message', 'Book saved !');
        // Save the book ID for later tests
        return Book.findOne({ title: 'Test Book' });
      })
      .then(createdBook => {
        testBookId = createdBook._id;
//console.log(testBookId);
        done();
      })
      .catch(err => {
        console.error('Error in book creation:', err);
        done(err);
      });
  });
  }); 

  describe('GET /api/books/:id', () => {
    it('should retrieve a specific book', async () => {
      const response = await request(app)
        .get(`/api/books/${testBookId}`);
      expect(response.status).toBe(200);
	  expect(JSON.parse(response.text)).toHaveProperty('title', 'Test Book');
    });

  it('should return 404 or 500 for non-existent book', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .get(`/api/books/${fakeId}`);
  expect([404, 500]).toContain(response.status);
});
  });

  describe('PUT /api/books/:id', () => {
    it('should update an existing book', async () => {
      const updatedBookData = {
		userId: userId,
        title: 'Updated Test Book',
        author: 'Updated Author',
        year: 2024,
        genre: 'Updated Genre',
		ratings: [{ userId: userId, grade: 3 }]
      };
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('book', JSON.stringify(updatedBookData))
        .attach('image', path.join(__dirname, 'updatedTestImage.jpg'));
      expect(response.status).toBe(200);
	  expect(JSON.parse(response.text)).toHaveProperty('message', 'Book updated!');
    });

    it('should reject update with invalid data', async () => {
      const invalidBookData = {
        title: '', 
        author: 'Updated Author',
        year: 'Not a number' 
      };
      const response = await request(app)
        .put(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookData);
      expect(response.status).toBe(400);
	  expect(JSON.parse(response.text)).toHaveProperty('error');
    });

    it('should reject update from unauthorized user', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({ email: 'unauthorized@example.com', password: 'UnauthorizedPass1' });
  const unauthorizedLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unauthorized@example.com', password: 'UnauthorizedPass1' });
  const unauthorizedToken = JSON.parse(unauthorizedLoginResponse.text).token;
  const UnauthorizedData = {
    userId: userId,
    title: 'Unauthorized Update',
    author: 'Updated Author',
    year: 2024,
    genre: 'Updated Genre',
    ratings: [{ userId: userId, grade: 3 }]
  };
  const response = await request(app)
    .put(`/api/books/${testBookId}`)
    .set('Authorization', `Bearer ${unauthorizedToken}`)
    .field('book', JSON.stringify(UnauthorizedData))
    .attach('image', path.join(__dirname, 'updatedTestImage.jpg'));
  expect(response.status).toBe(401);
  expect(JSON.parse(response.text)).toHaveProperty('message', 'Not authorized');
}); 
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete an existing book', async () => {
      const response = await request(app)
        .delete(`/api/books/${testBookId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
	  expect(JSON.parse(response.text)).toHaveProperty('message', 'Book deleted!');
      const deletedBook = await Book.findById(testBookId);
      expect(deletedBook).toBeNull();
    });

    it('should reject update from unauthorized user', async () => {
  await request(app)
    .post('/api/auth/signup')
    .send({ email: 'unauthorized@example.com', password: 'UnauthorizedPass1' });

  const unauthorizedLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unauthorized@example.com', password: 'UnauthorizedPass1' });
  const unauthorizedToken = JSON.parse(unauthorizedLoginResponse.text).token;
  const UnauthorizedData = {
    userId: userId,
    title: 'Unauthorized Update',
    author: 'Updated Author',
    year: 2024,
    genre: 'Updated Genre',
    ratings: [{ userId: userId, grade: 3 }]
  };
  const response = await request(app)
    .put(`/api/books/${testBookId}`)
    .set('Authorization', `Bearer ${unauthorizedToken}`)
    .field('book', JSON.stringify(UnauthorizedData))
    .attach('image', path.join(__dirname, 'updatedTestImage.jpg'));
  expect([400, 401]).toContain(response.status);
});

  });

afterAll(async () => {
await mongoose.disconnect();
  await mongoServer.stop();
});

