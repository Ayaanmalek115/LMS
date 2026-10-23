const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getGenres,
  getStats,
} = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/stats', getStats);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
