const Book = require('../models/Book');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Get all books with search, filter, and pagination
exports.getBooks = async (req, res) => {
  try {
    const { search, genre, availability, sort = 'createdAt', order = 'desc', limit = 50, page = 1 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { author: regex }, { isbn: regex }, { genre: regex }];
    }

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'borrowed') {
      query.availableCopies = 0;
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, description, coverImage, totalCopies, rating, publishYear } = req.body;

    const existing = await Book.findOne({ isbn });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
    }

    const copies = parseInt(totalCopies) || 1;
    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      description,
      coverImage: coverImage || undefined,
      totalCopies: copies,
      availableCopies: copies,
      rating: parseFloat(rating) || 4.5,
      publishYear: parseInt(publishYear) || new Date().getFullYear(),
    });

    res.status(201).json({ success: true, data: book, message: 'Book created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update book details
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { totalCopies, ...otherFields } = req.body;

    if (totalCopies !== undefined) {
      const newTotal = parseInt(totalCopies);
      const currentlyBorrowed = book.totalCopies - book.availableCopies;
      if (newTotal < currentlyBorrowed) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce total copies below currently borrowed count (${currentlyBorrowed})`,
        });
      }
      book.totalCopies = newTotal;
      book.availableCopies = newTotal - currentlyBorrowed;
    }

    Object.assign(book, otherFields);
    await book.save();

    res.json({ success: true, data: book, message: 'Book updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if there are active loans
    const activeIssue = await Issue.findOne({ book: book._id, status: 'issued' });
    if (activeIssue) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrow issues. Return copies first.',
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get list of distinct genres
exports.getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct('genre');
    res.json({ success: true, data: genres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get overall library stats
exports.getStats = async (req, res) => {
  try {
    const [totalBooks, availableCopiesResult, totalIssued, totalUsers] = await Promise.all([
      Book.countDocuments(),
      Book.aggregate([{ $group: { _id: null, totalAvailable: { $sum: '$availableCopies' }, totalCopies: { $sum: '$totalCopies' } } }]),
      Issue.countDocuments({ status: 'issued' }),
      User.countDocuments(),
    ]);

    const stats = {
      totalTitles: totalBooks,
      totalCopies: availableCopiesResult[0]?.totalCopies || 0,
      availableCopies: availableCopiesResult[0]?.totalAvailable || 0,
      activeLoans: totalIssued,
      totalUsers: totalUsers,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
