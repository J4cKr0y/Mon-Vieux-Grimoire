//route/books
const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Middleware GET books best rated
router.get('/bestrating', booksCtrl.getBestRatedBooks);
// Middleware POST books id rating
router.post('/:id/rating', auth, booksCtrl.addRating);

// Middleware POST books - CREATE
router.post('/', auth, multer, booksCtrl.createBook);
// Middleware GET books id - READ
router.get('/:id', booksCtrl.getOneBook);
// Middleware PUT books id - UPDATE
router.put('/:id', auth, multer, booksCtrl.modifyBook);
// Middleware DELETE books id - DELETE
router.delete('/:id', auth, booksCtrl.deleteBook);

// Middleware GET all books
router.get('/', booksCtrl.getAllBooks);

module.exports = router;