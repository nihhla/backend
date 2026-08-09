const Book = require('../models/Book');

const getBooks = async ({
  search,
  category,
  author,
  availability,
  featured,
  sort = 'newest',
  page = 1,
  limit = 12,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 12, 1), 50);

  const filter = {};

  if (search) {
    filter.$text = {
      $search: search.trim(),
    };
  }

  if (category) {
    filter.category = category.trim();
  }

  if (author) {
    filter.author = {
      $regex: author.trim(),
      $options: 'i',
    };
  }

  if (availability === 'available') {
    filter.availableCopies = {
      $gt: 0,
    };
  }

  if (availability === 'unavailable') {
    filter.availableCopies = {
      $lte: 0,
    };
  }

  if (featured === 'true' || featured === true) {
    filter.featured = true;
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    title: { title: 1 },
    points: { xpReward: -1 },
    popular: { createdAt: -1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  const skip = (currentPage - 1) * perPage;

  const [books, total] = await Promise.all([
    Book.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(perPage)
      .lean(),

    Book.countDocuments(filter),
  ]);

  return {
    books,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      pages: Math.ceil(total / perPage),
      hasNextPage: currentPage < Math.ceil(total / perPage),
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getBookById = async (bookId) => {
  const book = await Book.findById(bookId).lean();

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  return book;
};

const createBook = async (bookData) => {
  const {
    title,
    author,
    isbn,
    description,
    category,
    pages,
    cover,
    availableCopies,
    totalCopies,
    xpReward,
    difficulty,
    estimatedReadingTime,
    featured,
    quiz,
  } = bookData;

  if (
    !title ||
    !author ||
    !category ||
    !pages
  ) {
    const error = new Error(
      'Title, author, category and pages are required'
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(pages) < 1) {
    const error = new Error(
      'Pages must be greater than zero'
    );
    error.statusCode = 400;
    throw error;
  }

  if (isbn) {
    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      const error = new Error(
        'A book with this ISBN already exists'
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const book = await Book.create({
    title: title.trim(),
    author: author.trim(),
    isbn: isbn?.trim(),
    description: description || '',
    category: category.trim(),
    pages: Number(pages),
    cover: cover || '',
    availableCopies:
      availableCopies !== undefined
        ? Number(availableCopies)
        : 0,
    totalCopies:
      totalCopies !== undefined
        ? Number(totalCopies)
        : 1,
    xpReward:
      xpReward !== undefined
        ? Number(xpReward)
        : 50,
    difficulty: difficulty || 'intermediate',
    estimatedReadingTime:
      estimatedReadingTime !== undefined
        ? Number(estimatedReadingTime)
        : 0,
    featured: featured || false,
    quiz: quiz || [],
  });

  return book;
};

const updateBook = async (bookId, bookData) => {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  if (
    bookData.isbn &&
    bookData.isbn !== book.isbn
  ) {
    const existingBook = await Book.findOne({
      isbn: bookData.isbn,
      _id: { $ne: bookId },
    });

    if (existingBook) {
      const error = new Error(
        'A book with this ISBN already exists'
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const allowedFields = [
    'title',
    'author',
    'isbn',
    'description',
    'category',
    'pages',
    'cover',
    'availableCopies',
    'totalCopies',
    'xpReward',
    'difficulty',
    'estimatedReadingTime',
    'featured',
    'status',
    'quiz',
  ];

  allowedFields.forEach((field) => {
    if (bookData[field] !== undefined) {
      book[field] = bookData[field];
    }
  });

  await book.save();

  return book;
};

const deleteBook = async (bookId) => {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  await Book.findByIdAndDelete(bookId);

  return {
    id: bookId,
  };
};

const getCategories = async () => {
  return Book.distinct('category');
};

const getAuthors = async () => {
  return Book.distinct('author');
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getAuthors,
};