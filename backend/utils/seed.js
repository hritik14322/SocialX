const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Post = require('../models/Post');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialX';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing Users and Posts collections.');

    // Password hash for all seed accounts: "password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Reference Users inspired by TaskPlanet screenshot
    const users = await User.create([
      {
        username: 'nitin',
        email: 'nitin@taskplanet.com',
        password: hashedPassword,

      },
      {
        username: 'harshit',
        email: 'hira@taskplanet.com',
        password: hashedPassword,

      },
      {
        username: 'sandip',
        email: 'sandip@taskplanet.com',
        password: hashedPassword,
      },
    ]);

    const [nitin, hira, sandip] = users;

    // Create Sample Posts with embedded likes & embedded comments
    await Post.create([
      {
        author: nitin._id,
        content:
          'Earn Up to 10,000 Points with CPA Lead! 🚀\nTry CPA Lead offers, surveys, and tasks to earn points. If an eligible verified task isn\'t credited, compensation may be given after verification. Please keep screenshots as proof.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        likes: [hira._id, sandip._id],
        comments: [
          {
            user: hira._id,
            username: hira.username,
            text: 'Completed this offer! Credited instantly 🎉',
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            user: sandip._id,
            username: sandip.username,
            text: 'Awesome offer, thanks for sharing Nitin!',
            createdAt: new Date(Date.now() - 1800000),
          },
        ],
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        author: hira._id,
        content: 'Check out this new gaming task on SvipClub! Additional Info: Takes 30 mins, Credits in 11 hours. Completion: 100%.',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        likes: [nitin._id],
        comments: [
          {
            user: nitin._id,
            username: nitin.username,
            text: 'I will try this one out today!',
            createdAt: new Date(Date.now() - 600000),
          },
        ],
        createdAt: new Date(Date.now() - 360000),
      },
      {
        author: sandip._id,
        content: 'Top leaderboard milestone reached today! Keep grinding everyone 🥇💪',
        image: '',
        likes: [nitin._id, hira._id],
        comments: [],
        createdAt: new Date(Date.now() - 180000),
      },
    ]);

    console.log('Database seeded successfully with 3 users and 3 posts!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
