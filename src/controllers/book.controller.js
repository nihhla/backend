const asyncHandler = require('../utils/asyncHandler');

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getAuthors,
} = require('../services/book.service');

const { successResponse } = require('../utils/response');

const getAllBooks = asyncHandler(async (req, res) => {
  const result = await getBooks(req.query);

  return successResponse(
    res,
    result,
    'Books fetched successfully'
  );
});

const getSingleBook = asyncHandler(async (req, res) => {
  const book = await getBookById(req.params.id);

  return successResponse(
    res,
    { book },
    'Book fetched successfully'
  );
});

const addBook = asyncHandler(async (req, res) => {
  const book = await createBook(req.body);

  return successResponse(
    res,
    { book },
    'Book created successfully',
    201
  );
});

const editBook = asyncHandler(async (req, res) => {
  const book = await updateBook(
    req.params.id,
    req.body
  );

  return successResponse(
    res,
    { book },
    'Book updated successfully'
  );
});

const removeBook = asyncHandler(async (req, res) => {
  const result = await deleteBook(req.params.id);

  return successResponse(
    res,
    result,
    'Book deleted successfully'
  );
});

const getBookCategories = asyncHandler(
  async (req, res) => {
    const categories = await getCategories();

    return successResponse(
      res,
      { categories },
      'Categories fetched successfully'
    );
  }
);

const getBookAuthors = asyncHandler(
  async (req, res) => {
    const authors = await getAuthors();

    return successResponse(
      res,
      { authors },
      'Authors fetched successfully'
    );
  }
);

module.exports = {
  getAllBooks,
  getSingleBook,
  addBook,
  editBook,
  removeBook,
  getBookCategories,
  getBookAuthors,
};