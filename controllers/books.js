//controllers/books
const Book = require('../models/book');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');
const { performance, PerformanceObserver } = require('perf_hooks');
const processImageMid = require('../middleware/processImageMid');
const { validateBookData } = require('../middleware/validateBookData');
const escape = require('escape-html');

// POST - CREATE
exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
    Book.findOne({ title : bookObject.title })
    .then(oldBook => {
      if (oldBook) {
        return res.status(400).json({ error: 'Book already exist' });
	}})
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    title: escape(bookObject.title),
    author: escape(bookObject.author),
    genre: escape(bookObject.genre),
    imageUrl: req.imageUrl 
  });

  book.save()
    .then(() => { res.status(201).json({message: 'Book saved !'})})
    .catch(error => { res.status(400).json( { error })});
};

// GET ID - READ
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({error});
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error }));
};

// PUT - UPDATE
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: req.imageUrl 
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message : 'Not authorized'});
      } else {
        Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({message : 'Book updated !'}))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// DELETE
exports.deleteBook = async (req, res) => {
  const start = performance.now();
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      const duration = performance.now() - start;
      console.log(`deleteBook (book not found) took ${duration}ms`);
      return res.status(404).json({ error: 'Book not found' });
    }
    if (book.userId != req.auth.userId) {
      const duration = performance.now() - start;
      console.log(`deleteBook (unauthorized) took ${duration}ms`);
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (book.imageUrl) {
      const filename = book.imageUrl.split('/images/')[1];
      try {
        await fs.unlink(path.join('images', filename));
        console.log(`Image ${filename} deleted successfully`);
      } catch (unlinkError) {
        console.error("Error deleting image:", unlinkError);
      }
    }

    await Book.deleteOne({ _id: req.params.id });
    const duration = performance.now() - start;
    console.log(`deleteBook (success) took ${duration}ms`);
    res.status(200).json({ message: 'Book deleted!' });
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`deleteBook (error) took ${duration}ms:`, error);
    res.status(500).json({ error: error.message });
  }
};

// GET BEST RATED BOOKS
exports.getBestRatedBooks = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 }) 
        .limit(3) 
        .then(books => res.status(200).json(books))
        .catch(error => res.status(500).json({ error }));
};

// POST ID RATING
exports.addRating = (req, res) => {
    const { userId, rating } = req.body;
    const bookId = req.params.id;
    

    if (!userId || rating === undefined) {
        return res.status(400).json({ error: "UserId and rating are required." });
    }

    const grade = parseInt(rating, 10);
    if (isNaN(grade) || grade < 0 || grade > 5) {
        return res.status(400).json({ error: "The grade must be a number between 0 and 5." });
    }

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: "Book not found." });
            }

            const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
            if (existingRatingIndex !== -1) {
                return res.status(400).json({ error: "Book already rated." });
            }
            book.ratings.push({ userId, grade });
            const sum = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
            book.averageRating = Number((sum / book.ratings.length).toFixed(1));
            return book.save();
        })
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => {
            console.error("Error rating book.", error);
            res.status(500).json({ error: "Error rating book." });
        });
};

// GET ALL
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
