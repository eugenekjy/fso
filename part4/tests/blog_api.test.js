const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const api = supertest(app);

const getToken = async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'password' });
  return response.body.token;
};

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password', 10);

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash,
  });

  await user.save();

  const blog1 = new Blog({
    ...helper.initialBlogs[0],
    user: user._id,
  });

  const blog2 = new Blog({
    ...helper.initialBlogs[1],
    user: user._id,
  });

  await blog1.save();
  await blog2.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('correct number of blogs returned', async () => {
  const response = await api.get('/api/blogs');
  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test('a valid blog can be added', async () => {
  const token = await getToken();

  const newBlog = {
    title: 'Hello World 3',
    author: 'Eugene3',
    url: 'test-url3.com',
    likes: 6,
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map((n) => n.title);
  assert(contents.includes('Hello World 3'));
});

test('blog unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs');

  const blog = response.body[0];

  assert(blog.id !== undefined);
  assert(blog._id === undefined);
});

test('if likes property is missing it defaults to 0', async () => {
  const token = await getToken();

  const newBlog = {
    title: 'blog without likes',
    author: 'Eugene',
    url: 'test.com',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const addedBlog = blogsAtEnd.find((b) => b.title === 'blog without likes');

  assert.strictEqual(addedBlog.likes, 0);
});

test('if url is missing throw 400 bad request', async () => {
  const token = await getToken();

  const newBlog = {
    title: 'blog without likes',
    author: 'Eugene',
    likes: 5,
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400);
});

test('if title is missing throw 400 bad request', async () => {
  const token = await getToken();

  const newBlog = {
    author: 'Eugene',
    likes: 5,
    url: 'test.com',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400);
});

test('a blog can be deleted', async () => {
  const token = await getToken();

  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
});

test('a blog likes can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];

  const newLikes = blogToUpdate.likes + 1;

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: newLikes })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);

  assert.strictEqual(updatedBlog.likes, newLikes);
});

test('blog creation fails without token', async () => {
  const newBlog = {
    title: 'test blog',
    author: 'Eugene',
    url: 'https://test.com',
  };

  await api.post('/api/blogs').send(newBlog).expect(401);
});

after(async () => {
  await mongoose.connection.close();
});
