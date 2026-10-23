const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getIssues,
} = require('../controllers/issueController');

router.get('/', getIssues);
router.post('/borrow', issueBook);
router.post('/return', returnBook);

module.exports = router;
