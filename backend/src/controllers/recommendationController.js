const Book = require('../models/Book');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Personalized recommendations based on user's borrowing history and favorite genres
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    let user = null;
    let borrowedBookIds = [];
    const genreFrequencies = {};
    const authorFrequencies = {};

    if (userId && userId !== 'guest') {
      user = await User.findById(userId);
      if (user) {
        // Find all books user has ever borrowed
        const userIssues = await Issue.find({ user: userId }).populate('book');

        userIssues.forEach((issue) => {
          if (issue.book) {
            borrowedBookIds.push(issue.book._id.toString());
            const g = issue.book.genre;
            const a = issue.book.author;
            genreFrequencies[g] = (genreFrequencies[g] || 0) + 1;
            authorFrequencies[a] = (authorFrequencies[a] || 0) + 1;
          }
        });

        // Also add favorite genres if explicitly set
        if (Array.isArray(user.favoriteGenres)) {
          user.favoriteGenres.forEach((g) => {
            genreFrequencies[g] = (genreFrequencies[g] || 0) + 2;
          });
        }
      }
    }

    const allBooks = await Book.find({});

    // If user has no history or is guest, return popular top-rated books
    const hasHistory = Object.keys(genreFrequencies).length > 0;

    const scoredBooks = allBooks
      .filter((book) => !borrowedBookIds.includes(book._id.toString()))
      .map((book) => {
        let score = 0;
        let reasons = [];

        if (hasHistory) {
          // Genre frequency score
          const gCount = genreFrequencies[book.genre] || 0;
          if (gCount > 0) {
            score += gCount * 4;
            reasons.push(`Matches your interest in ${book.genre}`);
          }

          // Author frequency score
          const aCount = authorFrequencies[book.author] || 0;
          if (aCount > 0) {
            score += aCount * 5;
            reasons.push(`You previously enjoyed books by ${book.author}`);
          }
        }

        // Base quality signals (rating & general popularity)
        const ratingBonus = (book.rating || 4.0) * 1.5;
        const popularityBonus = Math.min((book.borrowCount || 0) * 0.5, 5);
        const inStockBonus = book.availableCopies > 0 ? 1 : 0;

        score += ratingBonus + popularityBonus + inStockBonus;

        if (reasons.length === 0) {
          if (book.rating >= 4.7) {
            reasons.push(`Critically acclaimed (${book.rating} ★) in ${book.genre}`);
          } else if (book.borrowCount > 2) {
            reasons.push(`Trending in ${book.genre}`);
          } else {
            reasons.push(`Top pick in ${book.genre}`);
          }
        }

        return {
          book,
          score,
          recommendationReason: reasons[0],
          isGenreMatch: hasHistory && Boolean(genreFrequencies[book.genre]),
        };
      });

    // Sort descending by score
    scoredBooks.sort((a, b) => b.score - a.score);

    const topRecommendations = scoredBooks.slice(0, limit).map((item) => ({
      ...item.book.toObject(),
      recommendationReason: item.recommendationReason,
      matchScore: Math.round(item.score * 10) / 10,
    }));

    res.json({
      success: true,
      hasPersonalization: hasHistory,
      user: user ? { _id: user._id, name: user.name, favoriteGenres: user.favoriteGenres } : null,
      topGenres: Object.keys(genreFrequencies),
      count: topRecommendations.length,
      data: topRecommendations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// "More Like This" recommendations for a specific book
exports.getSimilarBooks = async (req, res) => {
  try {
    const { bookId } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    const sourceBook = await Book.findById(bookId);
    if (!sourceBook) {
      return res.status(404).json({ success: false, message: 'Source book not found' });
    }

    const candidates = await Book.find({
      _id: { $ne: sourceBook._id },
      $or: [{ genre: sourceBook.genre }, { author: sourceBook.author }],
    })
      .sort({ rating: -1, borrowCount: -1 })
      .limit(limit);

    const similar = candidates.map((book) => {
      let reason = `Same category: ${sourceBook.genre}`;
      if (book.author === sourceBook.author) {
        reason = `Also written by ${sourceBook.author}`;
      }
      return {
        ...book.toObject(),
        recommendationReason: reason,
      };
    });

    res.json({
      success: true,
      sourceBook: {
        _id: sourceBook._id,
        title: sourceBook.title,
        genre: sourceBook.genre,
        author: sourceBook.author,
      },
      data: similar,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
