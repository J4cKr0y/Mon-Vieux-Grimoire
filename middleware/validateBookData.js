const validateBookData = (req, res, next) => {
  try {
    let bookData = req.body.book ? JSON.parse(req.body.book) : req.body;
    if (!bookData.title || !bookData.author || !bookData.year || !bookData.genre) {
      throw new Error('Missing required fields');
    }
    if (req.method === 'POST' && !bookData.ratings) {
      throw new Error('Missing required fields');
    }
    req.bookData = bookData;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { validateBookData };