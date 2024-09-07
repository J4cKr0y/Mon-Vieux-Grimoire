const validateBookData = (req, res, next) => {
  try {
    let bookData = req.body.book ? JSON.parse(req.body.book) : req.body;
    validateBookData(bookData);
    req.bookData = bookData;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = validateBookData;
