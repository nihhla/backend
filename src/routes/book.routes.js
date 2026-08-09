const express = require('express');

const {
  getAllBooks,
  getSingleBook,
  addBook,
  editBook,
  removeBook,
  getBookCategories,
  getBookAuthors,
} = require('../controllers/book.controller');

const {
  authenticate,
  requireAdmin,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getAllBooks);

router.get('/categories', getBookCategories);

router.get('/authors', getBookAuthors);

router.get('/:id', getSingleBook);

router.post(
  '/',
  authenticate,
  requireAdmin,
  addBook
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  editBook
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  removeBook
);

module.exports = router;