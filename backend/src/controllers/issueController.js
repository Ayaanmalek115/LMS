const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');

// Issue a book to a user
exports.issueBook = async (req, res) => {
  try {
    const { bookId, userId, days = 14 } = req.body;

    if (!bookId || !userId) {
      return res.status(400).json({ success: false, message: 'Book ID and User ID are required' });
    }

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId),
    ]);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No available copies of this book in stock' });
    }

    // Check if user already borrowed this book and hasn't returned it yet
    const alreadyIssued = await Issue.findOne({
      book: bookId,
      user: userId,
      status: 'issued',
    });

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: 'This user already has an active loan for this book',
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const issue = await Issue.create({
      book: bookId,
      user: userId,
      issueDate: new Date(),
      dueDate,
      status: 'issued',
    });

    // Update book inventory & count
    book.availableCopies -= 1;
    book.borrowCount = (book.borrowCount || 0) + 1;
    await book.save();

    const populated = await Issue.findById(issue._id)
      .populate('book', 'title author coverImage isbn genre')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: `"${book.title}" successfully issued to ${user.name}`,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Return an issued book
exports.returnBook = async (req, res) => {
  try {
    const { issueId, userId } = req.body;

    if (!issueId) {
      return res.status(400).json({ success: false, message: 'Issue ID is required' });
    }

    const issue = await Issue.findById(issueId).populate('book').populate('user');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue record not found' });
    }

    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'This book has already been returned' });
    }

    // Ownership check: only the person who borrowed the book (or a librarian) can return it!
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in as a library member to return a book.',
      });
    }

    const requestingUser = await User.findById(userId);
    const isBorrower = issue.user && issue.user._id.toString() === userId.toString();
    const isLibrarian = requestingUser && requestingUser.role === 'librarian';

    if (!isBorrower && !isLibrarian) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: This book was borrowed by "${issue.user?.name || 'another member'}". Only they can return this book!`,
      });
    }

    issue.status = 'returned';
    issue.returnDate = new Date();
    await issue.save();

    // Restock book copies
    if (issue.book) {
      const book = await Book.findById(issue.book._id);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        await book.save();
      }
    }

    const populated = await Issue.findById(issue._id)
      .populate('book', 'title author coverImage isbn genre')
      .populate('user', 'name email');

    res.json({
      success: true,
      message: `"${issue.book?.title || 'Book'}" returned successfully by ${requestingUser?.name || 'member'}!`,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all issues with filters
exports.getIssues = async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (userId) {
      filter.user = userId;
    }
    if (bookId) {
      filter.book = bookId;
    }

    const issues = await Issue.find(filter)
      .populate('book', 'title author coverImage isbn genre availableCopies totalCopies')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
