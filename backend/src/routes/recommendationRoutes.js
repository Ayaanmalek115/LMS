const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getSimilarBooks,
} = require('../controllers/recommendationController');

router.get('/user/:userId', getPersonalizedRecommendations);
router.get('/similar/:bookId', getSimilarBooks);

module.exports = router;
