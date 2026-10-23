const User = require('../models/User');
const Issue = require('../models/Issue');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ name: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single user by ID with their borrowing activity
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const issues = await Issue.find({ user: user._id })
      .populate('book', 'title author genre coverImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        history: issues,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a user
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, favoriteGenres } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      role: role || 'member',
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [],
    });

    res.status(201).json({ success: true, data: user, message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update user preferences
exports.updateUser = async (req, res) => {
  try {
    const { name, favoriteGenres } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;

    await user.save();
    res.json({ success: true, data: user, message: 'Preferences updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
