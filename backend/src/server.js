require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const Book = require('./models/Book');
const { seedData } = require('./seed');

const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const booksCount = await Book.countDocuments();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    booksCount,
    version: '1.0.0',
    service: 'Library Management & Recommendation API',
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    const dbInfo = await connectDB();

    // Auto-seed if the database has no books yet
    const existingCount = await Book.countDocuments();
    if (existingCount === 0) {
      console.log('Database is empty. Automatically seeding initial dataset...');
      await seedData();
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Library API Server running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}/api/health`);
      console.log(`💾 DB Mode: ${dbInfo.isInMemory ? 'In-Memory (Auto-fallback)' : 'External MongoDB'}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
