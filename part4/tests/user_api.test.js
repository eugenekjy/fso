const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'eugene', name: 'Existing User', passwordHash });
  await user.save();
});

test('creation fails with proper statuscode if username already taken', async () => {
  const newUser = {
    username: 'eugene',
    name: 'Superuser',
    password: 'sekret',
  };
  const usersAtStart = await User.find({});
  const response = await api.post('/api/users').send(newUser).expect(400);

  assert(response.body.error.includes('username'));

  const usersAtEnd = await User.find({});

  assert.strictEqual(usersAtEnd.length, usersAtStart.length);
});

test('creation fails with proper statuscode if username length is less than 3', async () => {
  const newUser = {
    username: 'eu',
    name: 'Superuser',
    password: 'sekret',
  };
  const usersAtStart = await User.find({});
  const response = await api.post('/api/users').send(newUser).expect(400);

  assert(response.body.error.includes('3 characters'));

  const usersAtEnd = await User.find({});

  assert.strictEqual(usersAtEnd.length, usersAtStart.length);
});

test('creation fails with proper statuscode if password length is less than 3', async () => {
  const newUser = {
    username: 'eugene',
    name: 'Superuser',
    password: 'se',
  };
  const usersAtStart = await User.find({});
  const response = await api.post('/api/users').send(newUser).expect(400);

  assert(response.body.error.includes('3 characters'));

  const usersAtEnd = await User.find({});

  assert.strictEqual(usersAtEnd.length, usersAtStart.length);
});

test('creation fails with proper statuscode if no password', async () => {
  const newUser = {
    username: 'eugene',
    name: 'Superuser',
  };
  const usersAtStart = await User.find({});
  const response = await api.post('/api/users').send(newUser).expect(400);

  assert(response.body.error.includes('3 characters'));

  const usersAtEnd = await User.find({});

  assert.strictEqual(usersAtEnd.length, usersAtStart.length);
});

after(async () => {
  await mongoose.connection.close();
});
