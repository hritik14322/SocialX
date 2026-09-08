const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'socialX_secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 2. Check for duplicate email or username
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Assign random rank badge for TaskPlanet theme
    const badges = ['Bronze', 'Gold', 'Legend'];
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];

    // 4. Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      badge: randomBadge,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        badge: user.badge,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        badge: user.badge,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        badge: user.badge,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe };
