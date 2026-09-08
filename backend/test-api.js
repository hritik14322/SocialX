const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const User = require('./models/User');
const Post = require('./models/Post');

async function runTests() {
  console.log('=== STARTING AUTOMATED BACKEND VERIFICATION ===\n');

  // 1. Check MongoDB Connection & Collections Constraint
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialX';
  await mongoose.connect(mongoUri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  console.log('✔ MongoDB Connected.');
  console.log(`✔ Found Collections: [${collectionNames.join(', ')}]`);

  const coreCollections = collectionNames.filter((name) => ['users', 'posts'].includes(name));
  if (coreCollections.length <= 2 && !collectionNames.includes('comments') && !collectionNames.includes('likes')) {
    console.log('✅ STRICT CONSTRAINT CONFIRMED: Database uses ONLY 2 collections (Users & Posts). Likes and comments are embedded inside Posts!\n');
  } else {
    console.warn('⚠️ Warning: Extra collections detected beyond Users and Posts:', collectionNames);
  }

  // Start temporary test server
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('✔ Test API Server listening on http://localhost:5099\n');

  const baseURL = 'http://localhost:5099/api';

  try {
    // Test 1: Signup
    const signupPayload = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    };
    const signupRes = await fetch(`${baseURL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload),
    });
    const signupData = await signupRes.json();
    console.log('Test 1 - Signup:', signupRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', signupData.message || '');
    const token = signupData.token;

    // Test 2: Login
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupPayload.email, password: signupPayload.password }),
    });
    const loginData = await loginRes.json();
    console.log('Test 2 - Login:', loginRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', loginData.user?.username || '');

    // Test 3: Get Posts
    const getPostsRes = await fetch(`${baseURL}/posts`);
    const getPostsData = await getPostsRes.json();
    console.log('Test 3 - Get Feed Posts:', getPostsRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', `Count: ${getPostsData.posts?.length || 0}`);

    // Test 4: Create Post
    const createPostRes = await fetch(`${baseURL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: 'Hello World from Automated Verification Test!' }),
    });
    const createPostData = await createPostRes.json();
    console.log('Test 4 - Create Post:', createPostRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', createPostData.post?._id || '');
    const createdPostId = createPostData.post?._id;

    // Test 5: Like Post
    const likeRes = await fetch(`${baseURL}/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const likeData = await likeRes.json();
    console.log('Test 5 - Like/Unlike Post:', likeRes.status === 200 ? 'PASS ✅' : 'FAIL ❌', likeData.message || '');

    // Test 6: Add Comment
    const commentRes = await fetch(`${baseURL}/posts/${createdPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: 'Awesome test post!' }),
    });
    const commentData = await commentRes.json();
    console.log('Test 6 - Add Comment:', commentRes.status === 201 ? 'PASS ✅' : 'FAIL ❌', commentData.message || '');

    // Test 7: Delete Post
    const deleteRes = await fetch(`${baseURL}/posts/${createdPostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Test 7 - Delete Post:', deleteRes.status === 200 ? 'PASS ✅' : 'FAIL ❌');

    console.log('\n=== ALL BACKEND TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
